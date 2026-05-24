import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../src/constants/colors";
import { useMessages, useSendMessage } from "../../src/hooks/useMessages";
import { useAuthStore } from "../../src/store/auth.store";

// ─── Brand tokens ────────────────────────────────────────────────────────────
const CREAM_PAPER = "rgba(255,250,232,0.85)";
const RULE = "rgba(184,132,60,0.22)";

// Avatar background colours matching prototype classes
const AV_AMBER = Colors.amber;      // default
const AV_SAGE = "#9CAF88";          // pt-msg__av--sage
const AV_INK = Colors.ink;          // pt-msg__av--ink (Maya)

// ─── Types ────────────────────────────────────────────────────────────────────
type MsgType = "in" | "out" | "system" | "scheduled";

interface AudioAttach {
  quote: string;
  duration: string;
  year: string;
  label: string;
}

interface Msg {
  id: string;
  type: MsgType;
  who?: string;
  avInitial?: string;
  avColor?: string;
  text?: string;
  time?: string;
  audio?: AudioAttach;
  // system / scheduled specific
  sysStrong?: string; // bold part inside system message
  schHead?: string;
  schBody?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initial, color }: { initial: string; color: string }) {
  const isInk = color === AV_INK;
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        // subtle inner glow matching prototype
        shadowColor: Colors.white,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isInk ? 0 : 0.35,
        shadowRadius: 0,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: "700",
          color: isInk ? Colors.bg : Colors.white,
          letterSpacing: 0.04 * 9,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

function AudioCard({ audio }: { audio: AudioAttach }) {
  return (
    <View
      style={{
        marginTop: 8,
        backgroundColor: "rgba(210,127,20,0.10)",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Play button */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: Colors.amber,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text style={{ color: Colors.white, fontSize: 9, marginLeft: 2 }}>▶</Text>
      </View>

      {/* Track info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Georgia",
            fontStyle: "italic",
            fontSize: 13,
            color: Colors.ink,
            lineHeight: 18,
          }}
        >
          "{audio.quote}"
        </Text>
        <Text
          style={{
            fontFamily: "System",
            fontSize: 10,
            color: Colors.inkMuted,
            marginTop: 2,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
        >
          {audio.duration} · {audio.year} · {audio.label}
        </Text>
      </View>
    </View>
  );
}

function SystemMsg({ msg }: { msg: Msg }) {
  return (
    <View style={{ alignItems: "center", marginVertical: 6 }}>
      <View
        style={{
          backgroundColor: "rgba(156,175,136,0.15)",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          maxWidth: "80%",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#4F6940",
            textAlign: "center",
            lineHeight: 17,
          }}
        >
          {msg.text}
          {msg.sysStrong ? (
            <Text style={{ fontWeight: "700" }}>{msg.sysStrong}</Text>
          ) : null}
          {" · opens on her 30th."}
        </Text>
      </View>
    </View>
  );
}

function ScheduledMsg({ msg }: { msg: Msg }) {
  return (
    <View
      style={{
        marginVertical: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "rgba(210,127,20,0.10)",
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(210,127,20,0.5)",
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          fontSize: 9.5,
          fontWeight: "700",
          color: Colors.amberDeep,
          letterSpacing: 0.8,
          marginBottom: 4,
        }}
      >
        {msg.schHead}
      </Text>
      <Text
        style={{
          fontFamily: "Georgia",
          fontStyle: "italic",
          fontSize: 12.5,
          color: Colors.inkSoft,
          lineHeight: 18,
        }}
      >
        {msg.schBody}
      </Text>
    </View>
  );
}

function InMsg({ msg }: { msg: Msg }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {/* Avatar */}
      {msg.avInitial ? (
        <Avatar initial={msg.avInitial} color={msg.avColor ?? AV_AMBER} />
      ) : (
        <View style={{ width: 28 }} />
      )}

      {/* Bubble */}
      <View style={{ maxWidth: "78%" }}>
        {msg.who && (
          <Text
            style={{
              fontSize: 9.5,
              fontWeight: "700",
              color: Colors.amberDeep,
              marginBottom: 3,
              letterSpacing: 0.3,
            }}
          >
            {msg.who}
          </Text>
        )}
        <View
          style={{
            backgroundColor: CREAM_PAPER,
            borderWidth: 1,
            borderColor: RULE,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          {msg.text && (
            <Text
              style={{
                fontSize: 13.5,
                color: Colors.ink,
                lineHeight: 19,
              }}
            >
              {msg.text}
            </Text>
          )}
          {msg.audio && <AudioCard audio={msg.audio} />}
          {msg.time && (
            <Text
              style={{
                fontSize: 10,
                color: Colors.inkMuted,
                marginTop: 4,
                letterSpacing: 0.3,
              }}
            >
              {msg.time}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function OutMsg({ msg }: { msg: Msg }) {
  return (
    <View style={{ alignItems: "flex-end" }}>
      <View
        style={{
          maxWidth: "78%",
          backgroundColor: Colors.ink,
          borderRadius: 16,
          borderBottomRightRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 9,
        }}
      >
        {msg.text && (
          <Text
            style={{
              fontSize: 13.5,
              color: Colors.bg,
              lineHeight: 19,
            }}
          >
            {msg.text}
          </Text>
        )}
        {msg.time && (
          <Text
            style={{
              fontSize: 10,
              color: "rgba(251,244,224,0.6)",
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            {msg.time} · You
          </Text>
        )}
      </View>
    </View>
  );
}

function renderMsg(msg: Msg) {
  switch (msg.type) {
    case "in":
      return <InMsg key={msg.id} msg={msg} />;
    case "out":
      return <OutMsg key={msg.id} msg={msg} />;
    case "system":
      return <SystemMsg key={msg.id} msg={msg} />;
    case "scheduled":
      return <ScheduledMsg key={msg.id} msg={msg} />;
  }
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState("");

  const user = useAuthStore((s) => s.user);
  const { data: dbMessages, isLoading } = useMessages();
  const sendMessage = useSendMessage();

  const messages: Msg[] = (dbMessages ?? []).map((m) => ({
    id: m.id,
    type:
      m.author_id === user?.id
        ? "out"
        : m.message_type === "system"
        ? "system"
        : m.message_type === "scheduled"
        ? "scheduled"
        : "in",
    who:
      m.message_type === "text" && m.author_id !== user?.id
        ? ((m as any).profiles?.full_name ?? "Family")
        : undefined,
    avInitial:
      m.message_type === "text" && m.author_id !== user?.id
        ? ((m as any).profiles?.full_name ?? "?").slice(0, 2).toUpperCase()
        : undefined,
    avColor: AV_AMBER,
    text: m.body ?? undefined,
    time: m.created_at
      ? new Date(m.created_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : undefined,
    audio: m.audio_quote
      ? {
          quote: m.audio_quote,
          duration: m.audio_duration ?? "",
          year: m.audio_year ?? "",
          label: m.audio_label ?? "",
        }
      : undefined,
    schHead: m.scheduled_head ?? undefined,
    schBody: m.scheduled_body ?? undefined,
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, []);

  function send() {
    const text = draft.trim();
    if (!text) return;
    sendMessage.mutate({ body: text });
    setDraft("");
    setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      80
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 14,
              paddingTop: 8,
              paddingBottom: 12,
              backgroundColor: Colors.bg,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(74,47,24,0.14)",
            }}
          >
            {/* Back */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                borderWidth: 1,
                borderColor: "rgba(74,47,24,0.14)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 22, color: Colors.inkSoft, lineHeight: 26 }}>
                ‹
              </Text>
            </Pressable>

            {/* Group avatar + name */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              {/* Gradient avatar matching prototype: linear-gradient(135deg, amber, ink) */}
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: Colors.amber,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: "600",
                  }}
                >
                  H
                </Text>
              </View>

              <View style={{ flexShrink: 1 }}>
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontSize: 14.5,
                    color: Colors.ink,
                    lineHeight: 18,
                  }}
                  numberOfLines={1}
                >
                  The Hayes
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: Colors.inkMuted,
                    marginTop: 1,
                  }}
                  numberOfLines={1}
                >
                  Private · 5 members · end-to-end encrypted
                </Text>
              </View>
            </View>

            {/* Options */}
            <Pressable
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 20, color: Colors.inkSoft, letterSpacing: 1 }}>
                ⋯
              </Text>
            </Pressable>
          </View>

          {/* ── Message list ────────────────────────────────────────────── */}
          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>Loading messages…</Text>
            </View>
          ) : (
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 14,
                  paddingTop: 10,
                  paddingBottom: 16,
                  gap: 10,
                }}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() =>
                  scrollRef.current?.scrollToEnd({ animated: false })
                }
              >
                {/* Date divider */}
                <View style={{ alignItems: "center", marginVertical: 8 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: Colors.inkMuted,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    Today
                  </Text>
                </View>

                {messages.map(renderMsg)}
              </ScrollView>
            </Animated.View>
          )}

          {/* ── Composer ────────────────────────────────────────────────── */}
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              // light cream background with amber-tinted border, matching pt-chat__compose
              backgroundColor: Colors.bg,
              borderTopWidth: 0,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255,250,232,0.9)",
                borderRadius: 26,
                borderWidth: 1,
                borderColor: "rgba(184,132,60,0.30)",
                paddingHorizontal: 14,
                paddingVertical: 6,
                shadowColor: Colors.ink,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.07,
                shadowRadius: 9,
                elevation: 3,
              }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write to the family…"
                placeholderTextColor={Colors.inkMuted}
                style={{
                  flex: 1,
                  fontSize: 13.5,
                  color: Colors.ink,
                  paddingVertical: 4,
                  maxHeight: 80,
                }}
                multiline
                returnKeyType="send"
                onSubmitEditing={send}
                blurOnSubmit={false}
              />

              {/* Send / mic button */}
              <Pressable
                onPress={send}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: draft.trim() ? Colors.amber : "rgba(210,127,20,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                  flexShrink: 0,
                })}
              >
                {draft.trim() ? (
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: 14,
                      lineHeight: 18,
                      marginBottom: 1,
                    }}
                  >
                    ↑
                  </Text>
                ) : (
                  <Feather name="mic" size={16} color={Colors.amberDeep} />
                )}
              </Pressable>
            </View>
          </View>

          <SafeAreaView edges={["bottom"]} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
