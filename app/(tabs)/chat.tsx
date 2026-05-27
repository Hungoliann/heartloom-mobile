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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

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
  useSendImageMessage,
  useToggleReaction,
  useDeleteMessage,
  useChatRealtime,
  useChatPresence,
  useMarkAsRead,
  useFamilyReads,
  type MessageWithProfile,
  type FamilyRead,
} from "../../src/hooks/useMessages";
import { useAudioRecorder } from "../../src/hooks/useAudioRecorder";
import { useAudioPlayer } from "../../src/hooks/useAudioPlayer";
import { ReactionPicker } from "../../src/components/chat/ReactionPicker";
import { ReactionChips } from "../../src/components/chat/ReactionChips";
import { SharedLetterCard } from "../../src/components/chat/SharedLetterCard";
import { LetterPickerModal } from "../../src/components/chat/LetterPickerModal";
import { ReplyPreview } from "../../src/components/chat/ReplyPreview";
import { ImageMessageBubble } from "../../src/components/chat/ImageMessageBubble";
import { ImageViewerModal } from "../../src/components/chat/ImageViewerModal";
import { TypingIndicator } from "../../src/components/chat/TypingIndicator";
import { ReadReceiptAvatars } from "../../src/components/chat/ReadReceiptAvatars";

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
  storedDurationMs?: number | null;
  isActivePlayer: boolean;
  onRequestPlay: () => void;
  onRequestPause: () => void;
}) {
  const { data: signedUrl } = useSignedAudioUrl(mediaUrl);
  const { play, pause, isPlaying, positionMs, durationMs, progress } =
    useAudioPlayer(signedUrl ?? null);

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
  onOpenImage,
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
  onOpenImage: (url: string) => void;
  activeVoiceId: string | null;
  setActiveVoiceId: (id: string | null) => void;
}) {
  const mediaType =
    (msg as any).media_type ?? (msg as any).message_type ?? "text";
  const isVoice = mediaType === "voice";
  const isSharedLetter = mediaType === "shared_letter";
  const isImage = mediaType === "image";
  const author = msg.profiles?.full_name ?? "Family";
  const reactions = msg.message_reactions ?? [];
  const sharedLetterId = (msg as any).shared_letter_id as string | null;
  const mediaUrl = (msg as any).media_url as string | null;
  const pending = (msg as any).pending === true;

  // Image bubble is rendered without a wrapping bubble (looks better).
  const inner =
    isSharedLetter && sharedLetterId ? (
      <SharedLetterCard
        letterId={sharedLetterId}
        isOut={isOut}
        onOpen={() => onOpenLetter(sharedLetterId)}
      />
    ) : isVoice ? (
      <VoiceBubble
        mediaUrl={mediaUrl}
        isOut={isOut}
        storedDurationMs={(msg as any).duration_ms ?? null}
        isActivePlayer={activeVoiceId === msg.id}
        onRequestPlay={() => setActiveVoiceId(msg.id)}
        onRequestPause={() => {
          if (activeVoiceId === msg.id) setActiveVoiceId(null);
        }}
      />
    ) : isImage ? (
      <ImageMessageBubble mediaUrl={mediaUrl} onOpen={onOpenImage} />
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
    );

  const bubble = (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => ({
        maxWidth: "78%",
        backgroundColor: isImage
          ? "transparent"
          : isOut
            ? Colors.amber
            : "rgba(255,250,232,0.92)",
        borderWidth: isImage || isOut ? 0 : 1,
        borderColor: "rgba(184,132,60,0.22)",
        borderRadius: 16,
        borderBottomRightRadius: isOut ? 4 : 16,
        borderBottomLeftRadius: isOut ? 16 : 4,
        paddingHorizontal: isImage ? 0 : 12,
        paddingVertical: isImage ? 0 : 9,
        opacity: (pressed && isOut ? 0.85 : 1) * (pending ? 0.65 : 1),
      })}
    >
      {!isOut && !isImage && (
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

      {inner}

      {!isImage && (
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
      )}
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

// ─── Composer "+" menu ──────────────────────────────────────────────────────
function PlusMenu({
  visible,
  onClose,
  onShareLetter,
  onPickImage,
}: {
  visible: boolean;
  onClose: () => void;
  onShareLetter: () => void;
  onPickImage: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: Colors.bg,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              paddingHorizontal: 18,
              paddingTop: 20,
              paddingBottom: 36,
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => {
                onClose();
                onShareLetter();
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="mail" size={20} color={Colors.amberDeep} />
              <Text style={{ fontSize: 15, color: Colors.ink }}>Share a letter</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onClose();
                onPickImage();
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="image" size={20} color={Colors.amberDeep} />
              <Text style={{ fontSize: 15, color: Colors.ink }}>Image</Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Composer ───────────────────────────────────────────────────────────────
function Composer({
  onSendText,
  onSendVoice,
  onOpenPlusMenu,
  onStartTyping,
  onStopTyping,
  sending,
  replyingTo,
  onClearReply,
}: {
  onSendText: (body: string) => void;
  onSendVoice: (uri: string, durationMs: number | null) => void;
  onOpenPlusMenu: () => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  sending: boolean;
  replyingTo: MessageWithProfile | null;
  onClearReply: () => void;
}) {
  const [draft, setDraft] = useState("");
  const recorder = useAudioRecorder();
  const { isRecording, seconds, startRecording, stopRecording } = recorder;
  const recordStartedAtRef = useRef<number | null>(null);

  async function handleMic() {
    recordStartedAtRef.current = Date.now();
    await startRecording();
  }

  async function handleStop() {
    const startedAt = recordStartedAtRef.current;
    await stopRecording();
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
    onStopTyping();
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
          onPress={onOpenPlusMenu}
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
            onChangeText={(t) => {
              setDraft(t);
              if (t.length > 0) onStartTyping();
              else onStopTyping();
            }}
            onBlur={onStopTyping}
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
  const {
    messages,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages();
  const sendText = useSendTextMessage();
  const sendVoice = useSendVoiceMessage();
  const sendSharedLetter = useSendSharedLetter();
  const sendImage = useSendImageMessage();
  const toggleReaction = useToggleReaction();
  const deleteMessage = useDeleteMessage();

  useChatRealtime(familyId, { enabled: !!familyId });
  const { typingUsers, startTyping, stopTyping } = useChatPresence(familyId);
  const markAsRead = useMarkAsRead(familyId);
  const { data: familyReads = [] } = useFamilyReads(familyId);

  const listRef = useRef<FlatList<MessageWithProfile>>(null);
  const memberCount = members?.length ?? 0;

  const [replyingTo, setReplyingTo] = useState<MessageWithProfile | null>(null);
  const [letterPickerOpen, setLetterPickerOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [pickerOpenForId, setPickerOpenForId] = useState<string | null>(null);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const nearBottomRef = useRef<boolean>(true);

  // Inverted list — newest at index 0. messages from hook are ASC; flip for display.
  const visible = useMemo(
    () =>
      [...messages]
        .filter((m) => !(m as any).deleted_at)
        .reverse(),
    [messages]
  );

  // Reply parent lookup (use raw, non-reversed array).
  const byId = useMemo(() => {
    const m = new Map<string, MessageWithProfile>();
    for (const msg of messages) m.set(msg.id, msg);
    return m;
  }, [messages]);

  // Map: messageId → list of (other) family members whose last_read_at reaches that message.
  // Algorithm: for each other member, find the latest message with created_at <= last_read_at
  // and attach them to that message.
  const readersByMessageId = useMemo(() => {
    const result = new Map<string, { user_id: string; full_name: string | null }[]>();
    if (!members || familyReads.length === 0) return result;
    const ascending = messages; // already ASC
    for (const r of familyReads as FamilyRead[]) {
      if (!r.last_read_at || r.user_id === user?.id) continue;
      const t = new Date(r.last_read_at).getTime();
      // Walk from newest backward to find first message at-or-before t.
      let attachTo: string | null = null;
      for (let i = ascending.length - 1; i >= 0; i--) {
        const m = ascending[i];
        // Only attach read receipts to messages from the current user (sent).
        if (m.author_id !== user?.id) continue;
        if (new Date(m.created_at ?? 0).getTime() <= t) {
          attachTo = m.id;
          break;
        }
      }
      if (!attachTo) continue;
      const member = members.find((p) => p.id === r.user_id);
      const existing = result.get(attachTo) ?? [];
      existing.push({
        user_id: r.user_id,
        full_name: member?.full_name ?? null,
      });
      result.set(attachTo, existing);
    }
    return result;
  }, [familyReads, members, messages, user?.id]);

  // Mark as read on mount / when new messages arrive while near bottom.
  useEffect(() => {
    if (!familyId) return;
    if (nearBottomRef.current) markAsRead();
  }, [familyId, messages.length, markAsRead]);

  function handleLongPress(msg: MessageWithProfile) {
    const isOut = msg.author_id === user?.id;
    const buttons: any[] = [
      { text: "React", onPress: () => setPickerOpenForId(msg.id) },
      { text: "Reply", onPress: () => setReplyingTo(msg) },
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
    sendVoice.mutate({ uri, durationMs, replyToId: replyingTo?.id ?? null });
    setReplyingTo(null);
  }

  function handlePickLetter(letterId: string) {
    sendSharedLetter.mutate({ letterId, replyToId: replyingTo?.id ?? null });
    setReplyingTo(null);
  }

  async function handlePickImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission needed",
          "Please enable photo library access in Settings to share images.",
          [{ text: "OK" }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        // mediaTypes.Images is deprecated but still works in SDK 54;
        // string literal "images" is the forward-compatible form.
        mediaTypes: "images" as any,
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      sendImage.mutate({ uri: asset.uri, replyToId: replyingTo?.id ?? null });
      setReplyingTo(null);
    } catch (err: any) {
      Alert.alert("Could not pick image", err?.message ?? "Please try again.");
    }
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
          {messagesLoading && messages.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={Colors.amberDeep} />
            </View>
          ) : !messagesLoading && visible.length === 0 ? (
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
              inverted
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => {
                const parentId = (item as any).reply_to_id as string | null;
                const parent = parentId ? byId.get(parentId) ?? null : null;
                const readers = readersByMessageId.get(item.id) ?? [];
                return (
                  <View>
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
                      onOpenImage={(url) => setViewerUrl(url)}
                      activeVoiceId={activeVoiceId}
                      setActiveVoiceId={setActiveVoiceId}
                    />
                    {readers.length > 0 ? (
                      <View style={{ alignItems: "flex-end", marginTop: 0 }}>
                        <ReadReceiptAvatars readers={readers} />
                      </View>
                    ) : null}
                  </View>
                );
              }}
              contentContainerStyle={{
                paddingHorizontal: 14,
                paddingTop: 12,
                paddingBottom: 12,
              }}
              onScroll={(e) => {
                const y = e.nativeEvent.contentOffset.y;
                // Inverted list — top of view (newest msg) is y ≈ 0.
                nearBottomRef.current = y < 80;
                if (nearBottomRef.current) markAsRead();
              }}
              scrollEventThrottle={250}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={{ paddingVertical: 14 }}>
                    <ActivityIndicator color={Colors.amberDeep} />
                  </View>
                ) : null
              }
            />
          )}

          {/* Typing indicator — placed between the list and composer so it
              hugs the input. (Spec said either above or below; below the list
              + above the composer feels most natural alongside the keyboard.) */}
          <TypingIndicator users={typingUsers} />

          {/* Composer */}
          <Composer
            onSendText={handleSendText}
            onSendVoice={handleSendVoice}
            onOpenPlusMenu={() => setPlusMenuOpen(true)}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            sending={
              sendText.isPending ||
              sendVoice.isPending ||
              sendSharedLetter.isPending ||
              sendImage.isPending
            }
            replyingTo={replyingTo}
            onClearReply={() => setReplyingTo(null)}
          />

          <SafeAreaView edges={["bottom"]} />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* "+" menu overlay */}
      <PlusMenu
        visible={plusMenuOpen}
        onClose={() => setPlusMenuOpen(false)}
        onShareLetter={() => setLetterPickerOpen(true)}
        onPickImage={handlePickImage}
      />

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

      {/* Full-screen image viewer */}
      <ImageViewerModal
        visible={!!viewerUrl}
        mediaUrl={viewerUrl}
        onClose={() => setViewerUrl(null)}
      />
    </View>
  );
}
