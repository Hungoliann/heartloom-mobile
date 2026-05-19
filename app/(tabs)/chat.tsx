import { useRef, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const SAGE_SOFT = "#E4ECD8";
const SAGE_DARK = "#3D5238";

type Message = {
  id: string;
  from: "in" | "out";
  name?: string;
  text: string;
  tag?: string;
  poll?: boolean;
  card?: boolean;
  ts?: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: "1", from: "in", name: "Nana", text: "Found the old recipe box ♡", ts: "9:41 AM" },
  { id: "2", from: "out", text: "Save it to the family vault?", ts: "9:42 AM" },
  { id: "3", from: "in", name: "Family Circle", text: "Private family space", card: true, ts: "9:43 AM" },
  { id: "4", from: "in", name: "Nana", text: "Sunday dinner at my place?", tag: "✓ RSVP", ts: "9:44 AM" },
  { id: "5", from: "out", text: "Who's bringing dessert?", poll: true, ts: "9:45 AM" },
  { id: "6", from: "in", name: "James", text: "I'll make the pie 🥧", ts: "9:46 AM" },
  { id: "7", from: "out", text: "Perfect. See everyone Sunday ♡", ts: "9:47 AM" },
];

function MessageBubble({ msg }: { msg: Message }) {
  const isOut = msg.from === "out";

  if (msg.card) {
    return (
      <View style={{ alignSelf: "flex-start", maxWidth: "75%" }}>
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, borderBottomLeftRadius: 4, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#9CAF88", alignItems: "center", justifyContent: "center" }}>
            <Feather name="users" size={14} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ fontSize: 9, fontWeight: "700", color: AMBER_DEEP, letterSpacing: 0.5, marginBottom: 1 }}>{msg.name?.toUpperCase()}</Text>
            <Text style={{ fontSize: 10.5, color: INK_MUTED }}>{msg.text}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ alignSelf: isOut ? "flex-end" : "flex-start", maxWidth: "75%" }}>
      <View
        style={{
          backgroundColor: isOut ? AMBER : "#FFFFFF",
          borderRadius: 14,
          borderBottomRightRadius: isOut ? 4 : 14,
          borderBottomLeftRadius: isOut ? 14 : 4,
          padding: 10,
          shadowColor: INK,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {!isOut && msg.name && (
          <Text style={{ fontSize: 9, fontWeight: "700", color: AMBER_DEEP, letterSpacing: 0.4, marginBottom: 3 }}>{msg.name}</Text>
        )}
        <Text style={{ fontSize: 13, color: isOut ? "#FFFFFF" : INK, lineHeight: 18 }}>{msg.text}</Text>
        {msg.tag && (
          <View style={{ alignSelf: "flex-start", marginTop: 5, backgroundColor: SAGE_SOFT, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ fontSize: 8.5, fontWeight: "600", color: SAGE_DARK }}>{msg.tag}</Text>
          </View>
        )}
        {msg.poll && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
            <View style={{ width: 11, height: 11, borderRadius: 5.5, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.25)" }} />
            <Text style={{ fontSize: 9.5, color: "rgba(255,255,255,0.9)" }}>Family poll</Text>
          </View>
        )}
      </View>
      {msg.ts && (
        <Text style={{ fontSize: 9, color: INK_MUTED, marginTop: 3, alignSelf: isOut ? "flex-end" : "flex-start", marginHorizontal: 4 }}>{msg.ts}</Text>
      )}
    </View>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function ChatScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  function sendMessage() {
    const text = message.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: "out", text, ts: formatTime(new Date()) },
    ]);
    setMessage("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(45,36,26,0.07)",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Feather name="chevron-left" size={20} color={INK_MUTED} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 13.5, fontFamily: "Georgia", fontWeight: "600", color: INK }}>Mitchell Family</Text>
              <Text style={{ fontSize: 10, color: AMBER_DEEP, fontWeight: "500", marginTop: 1 }}>5 members · all active</Text>
            </View>
            <Feather name="more-horizontal" size={20} color={INK_MUTED} />
          </View>

          {/* Messages */}
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {/* Date divider */}
              <View style={{ alignItems: "center", marginVertical: 6 }}>
                <View style={{ backgroundColor: "rgba(45,36,26,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 9.5, color: INK_MUTED, letterSpacing: 0.3 }}>Today</Text>
                </View>
              </View>

              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Input bar */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(45,36,26,0.07)", backgroundColor: "#FFFFFF" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: CREAM,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(45,36,26,0.1)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                gap: 8,
              }}
            >
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Send a message…"
                placeholderTextColor={INK_MUTED}
                style={{ flex: 1, fontSize: 13, color: INK_SOFT }}
                multiline
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <Pressable
                onPress={sendMessage}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: message.trim() ? AMBER : "rgba(45,36,26,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 11, marginLeft: 1 }}>➤</Text>
              </Pressable>
            </View>
          </View>

          <SafeAreaView edges={["bottom"]} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
