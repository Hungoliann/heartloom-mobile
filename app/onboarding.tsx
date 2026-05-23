import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/auth.store";

// ── Brand colors (extracted from prototype CSS) ──────────────────────────────
const CREAM = "#FAF3E2";        // --pt-cream / app background
const INK = "#2D241A";          // --pt-ink
const INK_SOFT = "#4A3D2E";     // --pt-ink-soft
const INK_MUTED = "#8A7A66";    // --pt-ink-mute
const AMBER_DEEP = "#B06600";   // --pt-amber-deep (italic em colour)
const RULE = "rgba(74,47,24,0.14)"; // --pt-rule (border colour)
const PAPER_BG = "rgba(255,251,243,0.6)"; // textarea background base

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
    <View style={{ flex: 1, backgroundColor: CREAM }}>
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
            {/*
              Prototype: .pt-wordmark
                font-family: var(--serif-alt) → Playfair Display / Georgia
                font-size: 13px
                letter-spacing: 0.34em
                text-align: center
                color: var(--pt-ink)
              Screen inner padding-top is 70px (welcome variant adds extra)
            */}
            <View style={{ width: "100%", alignItems: "center", paddingTop: 20, paddingBottom: 0 }}>
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontSize: 13,
                  fontWeight: "400",
                  letterSpacing: 4.5,
                  color: INK,
                  textAlign: "center",
                }}
              >
                HEARTLOOM
              </Text>
            </View>

            {/* ── Display heading ────────────────────────────────────────── */}
            {/*
              Prototype: .pt-display.pt-welcome__h.pt-welcome__h--prompt
                font-family: var(--serif-alt) → Playfair Display / Georgia
                font-weight: 500
                font-size: 28px (--prompt override)
                line-height: 1.18
                letter-spacing: -0.012em
                color: var(--pt-ink)
                margin: 4px 0 6px  (--prompt override adds gap: 16px in the inner flex)
              em → color: var(--pt-amber-deep), font-style: italic
            */}
            <View style={{ width: "100%", marginTop: 20, marginBottom: 0 }}>
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontSize: 28,
                  fontWeight: "500",
                  lineHeight: 33,
                  letterSpacing: -0.34,
                  color: INK,
                  textAlign: "center",
                }}
              >
                {"What is one thing\nyou want them\nto "}
                <Text
                  style={{
                    fontStyle: "italic",
                    color: AMBER_DEEP,
                  }}
                >
                  know forever?
                </Text>
              </Text>
            </View>

            {/* ── Subtext ────────────────────────────────────────────────── */}
            {/*
              Prototype: .pt-welcome__sub
                font-family: var(--serif) → Boska / Source Serif 4 / Georgia
                font-size: 15px
                color: var(--pt-ink-soft)
                margin: 0
              Gap between elements is 16px (flex gap in .pt-scr__inner)
            */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 15,
                lineHeight: 23,
                color: INK_SOFT,
                textAlign: "center",
                marginTop: 18,
                marginBottom: 0,
                width: "100%",
              }}
            >
              A sentence is enough. We'll thread it into something that lasts.
            </Text>

            {/* ── Textarea (pt-firstline) ─────────────────────────────────── */}
            {/*
              Prototype: .pt-firstline
                position: relative; display: block; margin: 6px 0 4px
              .pt-firstline__input
                width: 100%; min-height: 110px
                border: 1px solid var(--pt-rule)
                border-radius: 14px
                padding: 14px 16px 28px
                background: repeating-linear-gradient lined + rgba(255,251,243,.6)
                font-family: var(--script) or var(--serif) → Georgia
                font-size: 19px; line-height: 28px
                color: var(--pt-ink)
              .pt-firstline__count
                position: absolute; right: 14px; bottom: 8px
                font-size: 10.5px; letter-spacing: 0.05em; color: var(--pt-ink-mute)
            */}
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
                  borderColor: textareaFocused ? "#D27F14" : RULE,
                  borderRadius: 14,
                  backgroundColor: PAPER_BG,
                  // Shadow ring on focus is done via borderColor only (RN limitation)
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
                    fontFamily: "Georgia",
                    fontStyle: "italic",
                    fontSize: 19,
                    lineHeight: 28,
                    color: INK,
                    minHeight: 110,
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    // Extra bottom padding leaves room for the char counter
                    paddingBottom: 32,
                  }}
                />
              </View>

              {/* Char counter — sits at bottom-right of the textarea container */}
              <Text
                style={{
                  position: "absolute",
                  right: 14,
                  bottom: 8,
                  fontFamily: "System",
                  fontSize: 10.5,
                  letterSpacing: 0.5,
                  color: INK_MUTED,
                }}
              >
                {charCount} / {MAX_CHARS}
              </Text>
            </View>

            {/* ── Button row (pt-welcome__row) ────────────────────────────── */}
            {/*
              Prototype: .pt-welcome__row
                flex-direction: column; gap: 8px; margin-top: 4px
              .pt-btn
                width: 100%; min-height: 50px; padding: 13px 22px
                border-radius: 26px; font-size: 15px; font-weight: 500
              .pt-btn--primary
                background: var(--pt-ink) → #2D241A
                color: var(--pt-cream) → #FAF3E2
              .pt-btn--ghost
                background: transparent; color: var(--pt-ink)
                border: 1px solid var(--pt-rule)
              .pt-btn--inline → font-size: 13px; min-height: 42px
              .pt-btn__ico → margin-right: 6px
            */}
            <View style={{ width: "100%", marginTop: 16, alignSelf: "stretch" }}>
              {/* Primary: Draft Your First Future Letter */}
              <Pressable
                onPress={handleDraftLetter}
                style={({ pressed }) => ({
                  width: "100%",
                  alignSelf: "stretch",
                  backgroundColor: INK,
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
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: CREAM,
                    marginRight: 2,
                  }}
                >
                  {"✎ "}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: CREAM,
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
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: INK,
                    marginRight: 2,
                  }}
                >
                  {"● "}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: INK,
                  }}
                >
                  Record 60 seconds instead
                </Text>
              </Pressable>
            </View>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            {/*
              Prototype: .pt-welcome__foot
                font-family: var(--serif-alt) → Playfair Display / Georgia
                font-style: italic
                font-size: 12px
                color: var(--pt-ink-mute)
                margin: 4px 0 0
            */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontStyle: "italic",
                fontSize: 12,
                color: INK_MUTED,
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
