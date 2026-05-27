import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Pressable } from "../../src/components/ui/Pressable";
import { Colors } from "../../src/constants/colors";
import { SERIF, SERIF_ITALIC } from "../../src/constants/fonts";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth.store";
import { useFamily, useMyFamily } from "../../src/hooks/useFamily";
import {
  useMessages,
  useSendTextMessage,
  useSendVoiceMessage,
  useSendSharedLetter,
  useToggleReaction,
  useDeleteMessage,
  useChatRealtime,
  type MessageWithProfile,
} from "../../src/hooks/useMessages";
import { useAudioRecorder } from "../../src/hooks/useAudioRecorder";
import { useAudioPlayer } from "../../src/hooks/useAudioPlayer";
import { ReactionPicker } from "../../src/components/chat/ReactionPicker";
import { ReactionChips } from "../../src/components/chat/ReactionChips";
import { SharedLetterCard } from "../../src/components/chat/SharedLetterCard";
import { LetterPickerModal } from "../../src/components/chat/LetterPickerModal";
import { ReplyPreview } from "../../src/components/chat/ReplyPreview";

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtClock(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
function fmtMmSs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function initialOf(name: string | null | undefined) {
  if (!name) return "?";
  const c = name.trim()[0];
  return c ? c.toUpperCase() : "?";
}

// ─── Signed-URL hook (per voice message) ────────────────────────────────────
function useSignedAudioUrl(mediaUrl: string | null | undefined) {
  return useQuery({
    queryKey: ["chat-audio", mediaUrl],
    queryFn: async () => {
      if (!mediaUrl) return null;
      const { data, error } = await supabase.storage
        .from("voice-memos")
        .createSignedUrl(mediaUrl, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!mediaUrl,
    staleTime: 50 * 60 * 1000,
  });
}

// ─── Voice bubble ───────────────────────────────────────────────────────────
function VoiceBubble({
  mediaUrl,
  isOut,
  storedDurationMs,
  isActivePlayer,
  onRequestPlay,
  onRequestPause,
}: {
  mediaUrl: string | null | undefined;
  isOut: boolean;
  /** Server-stored duration (from message.duration_ms). Shown before audio loads. */
  storedDurationMs?: number | null;
  /** True if this is the currently selected/playing bubble. */
  isActivePlayer: boolean;
  onRequestPlay: () => void;
  onRequestPause: () => void;
}) {
  const { data: signedUrl } = useSignedAudioUrl(mediaUrl);
  const { play, pause, isPlaying, positionMs, durationMs, progress } =
    useAudioPlayer(signedUrl ?? null);

  // Coordination: when another bubble becomes active, ensure we pause.
  useEffect(() => {
    if (!isActivePlayer && isPlaying) {
      pause();
    }
  }, [isActivePlayer, isPlaying, pause]);

  const fg = isOut ? Colors.bg : Colors.amberDeep;
  const trackBg = isOut ? "rgba(251,244,224,0.25)" : "rgba(184,132,60,0.18)";

  const effectiveDuration =
    durationMs > 0
      ? durationMs
      : storedDurationMs && storedDurationMs > 0
        ? storedDurationMs
        : 0;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        minWidth: 160,
      }}
    >
      <Pressable
        onPress={() => {
          if (isPlaying) {
            onRequestPause();
            pause();
          } else {
            onRequestPlay();
            play();
          }
        }}
        disabled={!signedUrl}
        style={({ pressed }) => ({
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: isOut ? "rgba(251,244,224,0.18)" : Colors.amber,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.75 : signedUrl ? 1 : 0.5,
        })}
      >
        <Feather
          name={isPlaying ? "pause" : "play"}
          size={14}
          color={isOut ? Colors.bg : Colors.white}
          style={{ marginLeft: isPlaying ? 0 : 1 }}
        />
      </Pressable>

      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            height: 3,
            borderRadius: 2,
            backgroundColor: trackBg,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
              height: "100%",
              backgroundColor: fg,
            }}
          />
        </View>
        <Text style={{ fontSize: 10.5, color: fg, letterSpacing: 0.3 }}>
          {fmtMmSs(isPlaying || positionMs > 0 ? positionMs : effectiveDuration)}
        </Text>
      </View>
    </View>
  );
}

// ─── Message row ────────────────────────────────────────────────────────────
function MessageRow({
  msg,
  isOut,
  currentUserId,
  parent,
  onLongPress,
  onToggleReaction,
  onOpenLetter,
  activeVoiceId,
  setActiveVoiceId,
}: {
  msg: MessageWithProfile;
  isOut: boolean;
  currentUserId: string;
  parent: MessageWithProfile | null;
  onLongPress: () => void;
  onToggleReaction: (emoji: string) => void;
  onOpenLetter: (letterId: string) => void;
  activeVoiceId: string | null;
  setActiveVoiceId: (id: string | null) => void;
}) {
  const mediaType =
    (msg as any).media_type ?? (msg as any).message_type ?? "text";
  const isVoice = mediaType === "voice";
  const isSharedLetter = mediaType === "shared_letter";
  const author = msg.profiles?.full_name ?? "Family";
  const reactions = msg.message_reactions ?? [];
  const sharedLetterId = (msg as any).shared_letter_id as string | null;
  const pending = (msg as any).pending === true;

  const bubble = (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => ({
        maxWidth: "78%",
        backgroundColor: isOut ? Colors.amber : "rgba(255,250,232,0.92)",
        borderWidth: isOut ? 0 : 1,
        borderColor: "rgba(184,132,60,0.22)",
        borderRadius: 16,
        borderBottomRightRadius: isOut ? 4 : 16,
        borderBottomLeftRadius: isOut ? 16 : 4,
        paddingHorizontal: 12,
        paddingVertical: 9,
        opacity: (pressed && isOut ? 0.85 : 1) * (pending ? 0.65 : 1),
      })}
    >
      {!isOut && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: Colors.amberDeep,
            marginBottom: 3,
            letterSpacing: 0.3,
          }}
        >
          {author}
        </Text>
      )}

      {parent ? (
        <ReplyPreview message={parent} inBubble isOut={isOut} />
      ) : null}

      {isSharedLetter && sharedLetterId ? (
        <SharedLetterCard
          letterId={sharedLetterId}
          isOut={isOut}
          onOpen={() => onOpenLetter(sharedLetterId)}
        />
      ) : isVoice ? (
        <VoiceBubble
          mediaUrl={(msg as any).media_url}
          isOut={isOut}
          storedDurationMs={(msg as any).duration_ms ?? null}
          isActivePlayer={activeVoiceId === msg.id}
          onRequestPlay={() => setActiveVoiceId(msg.id)}
          onRequestPause={() => {
            if (activeVoiceId === msg.id) setActiveVoiceId(null);
          }}
        />
      ) : (
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isOut ? Colors.cream : Colors.ink,
          }}
        >
          {msg.body ?? ""}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginTop: 4,
          alignSelf: isOut ? "flex-end" : "flex-start",
        }}
      >
        {pending ? (
          <Text
            style={{
              fontSize: 10,
              color: isOut ? "rgba(251,244,224,0.7)" : Colors.inkMuted,
              fontStyle: "italic",
            }}
          >
            sending…
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: 10,
            color: isOut ? "rgba(251,244,224,0.7)" : Colors.inkMuted,
            letterSpacing: 0.3,
          }}
        >
          {fmtClock(msg.created_at)}
        </Text>
      </View>
    </Pressable>
  );

  const chips =
    reactions.length > 0 ? (
      <View style={{ alignItems: isOut ? "flex-end" : "flex-start", paddingHorizontal: isOut ? 0 : 36 }}>
        <ReactionChips
          reactions={reactions}
          currentUserId={currentUserId}
          onToggle={onToggleReaction}
        />
      </View>
    ) : null;

  if (isOut) {
    return (
      <View style={{ alignItems: "flex-end", marginVertical: 4 }}>
        {bubble}
        {chips}
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 4 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: Colors.amber,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 11 }}>
            {initialOf(author)}
          </Text>
        </View>
        {bubble}
      </View>
      {chips}
    </View>
  );
}

// ─── No-family empty state ──────────────────────────────────────────────────
function NoFamilyState({ onOpenFamily }: { onOpenFamily: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
        gap: 12,
      }}
    >
      <Feather name="users" size={32} color={Colors.amberDeep} />
      <Text
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          color: Colors.ink,
          textAlign: "center",
        }}
      >
        You don't have a family yet
      </Text>
      <Text
        style={{
          fontFamily: SERIF_ITALIC,
          fontStyle: "italic",
          fontSize: 14.5,
          color: Colors.inkMuted,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        Create one or join with an invite code to start chatting.
      </Text>
      <Pressable
        onPress={onOpenFamily}
        style={({ pressed }) => ({
          marginTop: 12,
          backgroundColor: "#2D4530",
          borderRadius: 12,
          paddingVertical: 13,
          paddingHorizontal: 28,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: Colors.white, fontWeight: "600", fontSize: 14 }}>
          Open Family
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Composer ───────────────────────────────────────────────────────────────
function Composer({
  onSendText,
  onSendVoice,
  onOpenLetterPicker,
  sending,
  replyingTo,
  onClearReply,
}: {
  onSendText: (body: string) => void;
  onSendVoice: (uri: string, durationMs: number | null) => void;
  onOpenLetterPicker: () => void;
  sending: boolean;
  replyingTo: MessageWithProfile | null;
  onClearReply: () => void;
}) {
  const [draft, setDraft] = useState("");
  const recorder = useAudioRecorder();
  const { isRecording, seconds, startRecording, stopRecording } = recorder;
  // Fallback timer if recorder doesn't expose duration after stop.
  const recordStartedAtRef = useRef<number | null>(null);

  async function handleMic() {
    recordStartedAtRef.current = Date.now();
    await startRecording();
  }

  async function handleStop() {
    const startedAt = recordStartedAtRef.current;
    await stopRecording();
    // expo-audio's `seconds` derives from durationMillis; prefer that if non-zero,
    // else fall back to wall-clock from when we kicked off recording.
    const recorderMs = seconds * 1000;
    const approxMs =
      recorderMs > 0
        ? recorderMs
        : startedAt
          ? Math.max(0, Date.now() - startedAt)
          : null;
    const uri = recorder.recordingUri;
    if (uri) onSendVoice(uri, approxMs);
    recordStartedAtRef.current = null;
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    onSendText(text);
    setDraft("");
  }

  if (isRecording) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: Colors.bg,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(184,98,65,0.10)",
            borderRadius: 26,
            borderWidth: 1,
            borderColor: "rgba(184,98,65,0.35)",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: Colors.terra,
            }}
          />
          <Text
            style={{
              fontSize: 13,
              color: Colors.terra,
              fontFamily: SERIF_ITALIC,
              fontStyle: "italic",
            }}
          >
            Recording… {fmtMmSs(seconds * 1000)}
          </Text>
        </View>
        <Pressable
          onPress={handleStop}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: Colors.terra,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Feather name="square" size={16} color={Colors.white} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: Colors.bg }}>
      {replyingTo ? (
        <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
          <ReplyPreview message={replyingTo} onClear={onClearReply} />
        </View>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Pressable
          onPress={onOpenLetterPicker}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "rgba(210,127,20,0.16)",
            borderWidth: 1,
            borderColor: "rgba(184,132,60,0.30)",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Feather name="plus" size={18} color={Colors.amberDeep} />
        </Pressable>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(255,250,232,0.92)",
            borderRadius: 26,
            borderWidth: 1,
            borderColor: "rgba(184,132,60,0.30)",
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write to the family…"
            placeholderTextColor={Colors.inkMuted}
            style={{
              flex: 1,
              fontSize: 14,
              color: Colors.ink,
              paddingVertical: 6,
              maxHeight: 90,
            }}
            multiline
            editable={!sending}
          />
        </View>

        {draft.trim() ? (
          <Pressable
            onPress={send}
            disabled={sending}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: Colors.amber,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed || sending ? 0.7 : 1,
            })}
          >
            <Feather name="arrow-up" size={18} color={Colors.white} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleMic}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "rgba(210,127,20,0.16)",
              borderWidth: 1,
              borderColor: "rgba(184,132,60,0.30)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Feather name="mic" size={18} color={Colors.amberDeep} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: family, isLoading: familyLoading } = useMyFamily();
  const { data: members } = useFamily();

  const familyId = family?.id ?? null;
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const sendText = useSendTextMessage();
  const sendVoice = useSendVoiceMessage();
  const sendSharedLetter = useSendSharedLetter();
  const toggleReaction = useToggleReaction();
  const deleteMessage = useDeleteMessage();

  useChatRealtime(familyId, { enabled: !!familyId });

  const listRef = useRef<FlatList<MessageWithProfile>>(null);
  const memberCount = members?.length ?? 0;

  const [replyingTo, setReplyingTo] = useState<MessageWithProfile | null>(null);
  const [letterPickerOpen, setLetterPickerOpen] = useState(false);
  const [pickerOpenForId, setPickerOpenForId] = useState<string | null>(null);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  const visible = useMemo(
    () => messages.filter((m) => !(m as any).deleted_at),
    [messages]
  );

  // Lookup map for reply parents.
  const byId = useMemo(() => {
    const m = new Map<string, MessageWithProfile>();
    for (const msg of messages) m.set(msg.id, msg);
    return m;
  }, [messages]);

  // Scroll to bottom whenever the list changes.
  useEffect(() => {
    if (visible.length === 0) return;
    const id = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: false }),
      30
    );
    return () => clearTimeout(id);
  }, [visible.length]);

  function handleLongPress(msg: MessageWithProfile) {
    const isOut = msg.author_id === user?.id;
    // Spec ambiguity resolved: action sheet via Alert.alert with cancellable
    // buttons. On iOS this renders as a native sheet; on Android it's a dialog.
    const buttons: any[] = [
      {
        text: "React",
        onPress: () => setPickerOpenForId(msg.id),
      },
      {
        text: "Reply",
        onPress: () => setReplyingTo(msg),
      },
    ];
    if (isOut) {
      buttons.push({
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert(
            "Delete this message?",
            "It will be removed from everyone's view.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteMessage.mutate({ id: msg.id }),
              },
            ]
          ),
      });
    }
    buttons.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Message", undefined, buttons);
  }

  function handleSendText(body: string) {
    sendText.mutate({ body, replyToId: replyingTo?.id ?? null });
    setReplyingTo(null);
  }

  function handleSendVoice(uri: string, durationMs: number | null) {
    sendVoice.mutate({
      uri,
      durationMs,
      replyToId: replyingTo?.id ?? null,
    });
    setReplyingTo(null);
  }

  function handlePickLetter(letterId: string) {
    sendSharedLetter.mutate({
      letterId,
      replyToId: replyingTo?.id ?? null,
    });
    setReplyingTo(null);
  }

  // ── Loading state for family lookup ──────────────────────────────────────
  if (familyLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={Colors.amberDeep} />
        </View>
      </SafeAreaView>
    );
  }

  // ── No family → onboarding prompt ────────────────────────────────────────
  if (!family) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
        <NoFamilyState onOpenFamily={() => router.push("/(tabs)/family")} />
      </SafeAreaView>
    );
  }

  // ── Main chat ────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 6,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.rule,
            }}
          >
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                color: Colors.ink,
                lineHeight: 24,
              }}
              numberOfLines={1}
            >
              {family.name}
            </Text>
            <Text style={{ fontSize: 11.5, color: Colors.inkMuted, marginTop: 2 }}>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </Text>
          </View>

          {/* Messages */}
          {messagesLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={Colors.amberDeep} />
            </View>
          ) : visible.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 32,
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF_ITALIC,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: Colors.inkMuted,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Say hello. This is your family's space.
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={visible}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => {
                const parentId = (item as any).reply_to_id as string | null;
                const parent = parentId ? byId.get(parentId) ?? null : null;
                return (
                  <MessageRow
                    msg={item}
                    isOut={item.author_id === user?.id}
                    currentUserId={user?.id ?? ""}
                    parent={parent}
                    onLongPress={() => handleLongPress(item)}
                    onToggleReaction={(emoji) =>
                      toggleReaction.mutate({ messageId: item.id, emoji })
                    }
                    onOpenLetter={(letterId) =>
                      router.push(`/letter?letterId=${letterId}` as any)
                    }
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                );
              }}
              contentContainerStyle={{
                paddingHorizontal: 14,
                paddingTop: 12,
                paddingBottom: 12,
              }}
              onContentSizeChange={() =>
                listRef.current?.scrollToEnd({ animated: false })
              }
            />
          )}

          {/* Composer */}
          <Composer
            onSendText={handleSendText}
            onSendVoice={handleSendVoice}
            onOpenLetterPicker={() => setLetterPickerOpen(true)}
            sending={
              sendText.isPending ||
              sendVoice.isPending ||
              sendSharedLetter.isPending
            }
            replyingTo={replyingTo}
            onClearReply={() => setReplyingTo(null)}
          />

          <SafeAreaView edges={["bottom"]} />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Reaction picker overlay */}
      <ReactionPicker
        visible={!!pickerOpenForId}
        onSelect={(emoji) => {
          if (pickerOpenForId) {
            toggleReaction.mutate({ messageId: pickerOpenForId, emoji });
          }
          setPickerOpenForId(null);
        }}
        onDismiss={() => setPickerOpenForId(null)}
      />

      {/* Letter picker overlay */}
      <LetterPickerModal
        visible={letterPickerOpen}
        onClose={() => setLetterPickerOpen(false)}
        onSelect={handlePickLetter}
      />
    </View>
  );
}
