import { Pressable } from "../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../src/constants/fonts";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/auth.store";
import { Colors } from "../src/constants/colors";

// Textarea background: semi-transparent warm white overlay (not a brand token)
const PAPER_BG = "rgba(255,251,243,0.6)";

const MAX_CHARS = 240;

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasOnboarded = useAuthStore((s) => s.setHasOnboarded);
  const [text, setText] = useState("");
  const [textareaFocused, setTextareaFocused] = useState(false);

  function handleDraftLetter() {
    setHasOnboarded();
    router.replace("/record");
  }

  function handleVoiceRecord() {
    setHasOnboarded();
    router.replace({ pathname: "/record", params: { mode: "voice" } });
  }

  const charCount = text.length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 22,
              paddingBottom: 32,
              alignItems: "center",
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── HEARTLOOM wordmark ─────────────────────────────────────── */}
            <View style={{ width: "100%", alignItems: "center", paddingTop: 20, paddingBottom: 0 }}>
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  fontWeight: "400",
                  letterSpacing: 4.5,
                  color: Colors.ink,
                  textAlign: "center",
                }}
              >
                HEARTLOOM
              </Text>
            </View>

            {/* ── Display heading ────────────────────────────────────────── */}
            <View style={{ width: "100%", marginTop: 20, marginBottom: 0 }}>
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 28,
                  fontWeight: "500",
                  lineHeight: 33,
                  letterSpacing: -0.34,
                  color: Colors.ink,
                  textAlign: "center",
                }}
              >
                {"What is one thing\nyou want them\nto "}
                <Text
                  style={{
                    fontStyle: "italic",
                    color: Colors.amberDeep,
                  }}
                >
                  know forever?
                </Text>
              </Text>
            </View>

            {/* ── Subtext ────────────────────────────────────────────────── */}
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 23,
                color: Colors.inkSoft,
                textAlign: "center",
                marginTop: 18,
                marginBottom: 0,
                width: "100%",
              }}
            >
              A sentence is enough. We'll thread it into something that lasts.
            </Text>

            {/* ── Textarea (pt-firstline) ─────────────────────────────────── */}
            <View
              style={{
                width: "100%",
                marginTop: 16,
                marginBottom: 0,
                position: "relative",
              }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: textareaFocused ? Colors.amber : Colors.rule,
                  borderRadius: 14,
                  backgroundColor: PAPER_BG,
                  overflow: "hidden",
                }}
              >
                <TextInput
                  value={text}
                  onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
                  onFocus={() => setTextareaFocused(true)}
                  onBlur={() => setTextareaFocused(false)}
                  placeholder="Be brave enough to be soft…"
                  placeholderTextColor="rgba(74,47,24,0.42)"
                  multiline
                  textAlignVertical="top"
                  style={{
                    fontFamily: SERIF_ITALIC,
                    fontStyle: "italic",
                    fontSize: 19,
                    lineHeight: 28,
                    color: Colors.ink,
                    minHeight: 110,
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 32,
                  }}
                />
              </View>

              {/* Char counter */}
              <Text
                style={{
                  position: "absolute",
                  right: 14,
                  bottom: 8,
                  fontFamily: "System",
                  fontSize: 10.5,
                  letterSpacing: 0.5,
                  color: Colors.inkMuted,
                }}
              >
                {charCount} / {MAX_CHARS}
              </Text>
            </View>

            {/* ── Button row ────────────────────────────────────────────── */}
            <View style={{ width: "100%", marginTop: 16, alignSelf: "stretch" }}>
              {/* Primary: Draft Your First Future Letter */}
              <Pressable
                onPress={handleDraftLetter}
                style={({ pressed }) => ({
                  width: "100%",
                  alignSelf: "stretch",
                  backgroundColor: Colors.ink,
                  borderRadius: 26,
                  minHeight: 50,
                  paddingVertical: 13,
                  paddingHorizontal: 22,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.9 : 1,
                  marginBottom: 8,
                })}
              >
                <Ionicons
                  name="create-outline"
                  size={17}
                  color={Colors.cream}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: Colors.cream,
                  }}
                >
                  Draft Your First Future Letter
                </Text>
              </Pressable>

              {/* Ghost: Record 60 seconds instead */}
              <Pressable
                onPress={handleVoiceRecord}
                style={({ pressed }) => ({
                  width: "100%",
                  alignSelf: "stretch",
                  backgroundColor: "transparent",
                  borderRadius: 26,
                  minHeight: 42,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(74,47,24,0.35)",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.ink,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: Colors.ink,
                  }}
                >
                  Record 60 seconds instead
                </Text>
              </Pressable>
            </View>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <Text
              style={{
                fontFamily: SERIF_ITALIC,
                fontStyle: "italic",
                fontSize: 12,
                color: Colors.inkMuted,
                textAlign: "center",
                marginTop: 16,
                lineHeight: 18,
                width: "100%",
              }}
            >
              No account yet. No payment. We'll only ask for more when life does.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
