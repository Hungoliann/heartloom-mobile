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
  useDeleteMessage,
  useChatRealtime,
  type MessageWithProfile,
} from "../../src/hooks/useMessages";
import { useAudioRecorder } from "../../src/hooks/useAudioRecorder";
import { useAudioPlayer } from "../../src/hooks/useAudioPlayer";

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
}: {
  mediaUrl: string | null | undefined;
  isOut: boolean;
}) {
  const { data: signedUrl } = useSignedAudioUrl(mediaUrl);
  const { play, pause, isPlaying, positionMs, durationMs, progress } =
    useAudioPlayer(signedUrl ?? null);

  const fg = isOut ? Colors.bg : Colors.amberDeep;
  const trackBg = isOut ? "rgba(251,244,224,0.25)" : "rgba(184,132,60,0.18)";

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
        onPress={() => (isPlaying ? pause() : play())}
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
          {fmtMmSs(isPlaying || positionMs > 0 ? positionMs : durationMs)}
        </Text>
      </View>
    </View>
  );
}

// ─── Message row ────────────────────────────────────────────────────────────
function MessageRow({
  msg,
  isOut,
  onLongPress,
}: {
  msg: MessageWithProfile;
  isOut: boolean;
  onLongPress?: () => void;
}) {
  const isVoice =
    (msg as any).media_type === "voice" || msg.message_type === "voice";
  const author = msg.profiles?.full_name ?? "Family";

  const bubble = (
    <Pressable
      onLongPress={isOut ? onLongPress : undefined}
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
        opacity: pressed && isOut ? 0.85 : 1,
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

      {isVoice ? (
        <VoiceBubble mediaUrl={(msg as any).media_url} isOut={isOut} />
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

      <Text
        style={{
          fontSize: 10,
          color: isOut ? "rgba(251,244,224,0.7)" : Colors.inkMuted,
          marginTop: 4,
          letterSpacing: 0.3,
          alignSelf: isOut ? "flex-end" : "flex-start",
        }}
      >
        {fmtClock(msg.created_at)}
      </Text>
    </Pressable>
  );

  if (isOut) {
    return <View style={{ alignItems: "flex-end", marginVertical: 4 }}>{bubble}</View>;
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        marginVertical: 4,
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
  sending,
}: {
  onSendText: (body: string) => void;
  onSendVoice: (uri: string) => void;
  sending: boolean;
}) {
  const [draft, setDraft] = useState("");
  const recorder = useAudioRecorder();
  const { isRecording, seconds, startRecording, stopRecording } = recorder;

  async function handleMic() {
    await startRecording();
  }

  async function handleStop() {
    await stopRecording();
    // recorder.recordingUri updates inside stopRecording — read via a small delay.
    // expo-audio sets it synchronously after stop() resolves.
    const uri = recorder.recordingUri;
    if (uri) onSendVoice(uri);
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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
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
  const deleteMessage = useDeleteMessage();

  useChatRealtime(familyId, { enabled: !!familyId });

  const listRef = useRef<FlatList<MessageWithProfile>>(null);
  const memberCount = members?.length ?? 0;

  const visible = useMemo(
    () => messages.filter((m) => !(m as any).deleted_at),
    [messages]
  );

  // Scroll to bottom whenever the list changes.
  useEffect(() => {
    if (visible.length === 0) return;
    const id = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: false }),
      30
    );
    return () => clearTimeout(id);
  }, [visible.length]);

  function handleLongPressOwn(id: string) {
    Alert.alert("Delete this message?", "It will be removed from everyone's view.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMessage.mutate({ id }),
      },
    ]);
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
              renderItem={({ item }) => (
                <MessageRow
                  msg={item}
                  isOut={item.author_id === user?.id}
                  onLongPress={() => handleLongPressOwn(item.id)}
                />
              )}
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
            onSendText={(body) => sendText.mutate({ body })}
            onSendVoice={(uri) => sendVoice.mutate({ uri })}
            sending={sendText.isPending || sendVoice.isPending}
          />

          <SafeAreaView edges={["bottom"]} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
