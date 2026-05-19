import { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

const SCREEN_W = Dimensions.get("window").width;
const BG = "#1A1108";
const BG2 = "#2A1C10";
const AMBER = "#D27F14";
const AMBER_LIGHT = "#E8A851";
const CREAM = "#FAF3E2";
const CREAM_DIM = "rgba(250,243,226,0.72)";
const CREAM_FAINT = "rgba(250,243,226,0.2)";
const RULE = "rgba(74,47,24,0.4)";
const INPUT_BG = "rgba(250,243,226,0.06)";
const TERRA = "#B86241";
const TERRA_DEEP = "#8B4226";

const TOTAL_STEPS = 7;

const PROMPTS = [
  { id: "1", line1: "If you could only leave", line2: "one piece of advice", line3: "for Maya…" },
  { id: "2", line1: "Tell me about", line2: "the first home", line3: "you ever loved." },
  { id: "3", line1: "What is one thing", line2: "you want them", line3: "to know forever?" },
  { id: "4", line1: "Describe the moment", line2: "you became", line3: "yourself." },
];

const RELATIONSHIPS = ["Granddaughter", "Daughter", "Son", "Partner", "Friend", "Other"];

const DELIVERY_OPTIONS = [
  { id: "date", label: "On a specific date", sub: "Birthday, anniversary, graduation", value: "June 14, 2034" },
  { id: "milestone", label: "On a milestone", sub: "\"When Maya gets engaged\"" },
  { id: "ask", label: "Whenever Maya asks", sub: "She'll be told it exists, on a day you choose." },
  { id: "now", label: "Right now", sub: "Some letters shouldn't wait." },
];

const BAR_COUNT = 24;

function WaveformBars({ active }: { active: boolean }) {
  const bars = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.08))).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((b) => Animated.spring(b, { toValue: 0.08, useNativeDriver: false }).start());
      return;
    }
    function animateBar(bar: Animated.Value) {
      const peak = 0.2 + Math.random() * 0.75;
      const dur = 200 + Math.random() * 300;
      Animated.sequence([
        Animated.timing(bar, { toValue: peak, duration: dur, useNativeDriver: false }),
        Animated.timing(bar, { toValue: 0.08 + Math.random() * 0.2, duration: dur, useNativeDriver: false }),
      ]).start(() => animateBar(bar));
    }
    bars.forEach((b, i) => setTimeout(() => animateBar(b), i * 30));
    return () => bars.forEach((b) => b.stopAnimation());
  }, [active]);

  const barW = Math.floor((SCREEN_W - 64) / BAR_COUNT) - 2;
  const maxH = 56;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: maxH, gap: 2, paddingHorizontal: 32 }}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: barW,
            height: bar.interpolate({ inputRange: [0, 1], outputRange: [2, maxH] }),
            backgroundColor: AMBER,
            borderRadius: barW / 2,
            opacity: 0.7 + i % 3 * 0.1,
          }}
        />
      ))}
    </View>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", marginTop: 8 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === step ? 20 : 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: i <= step ? AMBER : CREAM_FAINT,
          }}
        />
      ))}
    </View>
  );
}

export default function RecordScreen() {
  const router = useRouter();
  const { promptId } = useLocalSearchParams<{ promptId?: string }>();
  const initialPromptIdx = promptId ? Math.max(PROMPTS.findIndex((p) => p.id === promptId), 0) : 0;
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [relationship, setRelationship] = useState("Granddaughter");
  const [promptIdx, setPromptIdx] = useState(initialPromptIdx);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [signature, setSignature] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("date");
  const [isSealed, setIsSealed] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const sealProgress = useRef(new Animated.Value(0)).current;
  const certScale = useRef(new Animated.Value(0.85)).current;
  const certOpacity = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const sealHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const certId = useMemo(() => `HL-${Date.now().toString(36).toUpperCase().slice(-8)}`, []);

  useEffect(() => {
    if (step === 6) {
      Animated.parallel([
        Animated.spring(certScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.timing(certOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [step]);

  useEffect(() => {
    if (!isRecording || isPaused) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording, isPaused]);

  // Pulsing orb for mic check step
  useEffect(() => {
    if (step !== 2) return;
    function pulse() {
      Animated.sequence([
        Animated.timing(orbScale, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]).start(pulse);
    }
    pulse();
    return () => orbScale.stopAnimation();
  }, [step]);

  function nextStep() {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), 160);
  }

  function prevStep() {
    if (step === 0) { router.back(); return; }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep((s) => Math.max(s - 1, 0)), 140);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function onSealPressIn() {
    sealProgress.setValue(0);
    Animated.timing(sealProgress, { toValue: 1, duration: 2200, useNativeDriver: false }).start(({ finished }) => {
      if (finished) {
        setIsSealed(true);
        setTimeout(() => nextStep(), 600);
      }
    });
  }

  function onSealPressOut() {
    sealProgress.stopAnimation();
    if (!isSealed) sealProgress.setValue(0);
  }

  const prompt = PROMPTS[promptIdx];

  const Steps = [
    // ── Step 0: Recipient ──────────────────────────────────────────
    <View key="0">
      <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 28, color: CREAM, lineHeight: 36, marginBottom: 6 }}>
        Name one person{"\n"}you're recording{" "}
        <Text style={{ color: AMBER }}>for.</Text>
      </Text>
      <Text style={{ fontSize: 13, color: CREAM_DIM, lineHeight: 19, marginBottom: 28 }}>
        You can add more later. Start with the one that's been on your mind.
      </Text>

      <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: RULE, paddingHorizontal: 16, marginBottom: 6 }}>
        <Text style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: "700", color: "rgba(250,243,226,0.4)", textTransform: "uppercase", paddingTop: 12, marginBottom: 2 }}>Their name</Text>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Maya"
          placeholderTextColor="rgba(250,243,226,0.2)"
          style={{ fontSize: 20, color: CREAM, paddingBottom: 14, fontFamily: "Georgia" }}
          autoFocus
        />
      </View>
      <Text style={{ fontSize: 11, color: "rgba(250,243,226,0.35)", marginBottom: 20 }}>First name is enough.</Text>

      <Text style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: "700", color: "rgba(250,243,226,0.4)", textTransform: "uppercase", marginBottom: 10 }}>Your relationship</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
        {RELATIONSHIPS.map((rel) => (
          <Pressable
            key={rel}
            onPress={() => setRelationship(rel)}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: relationship === rel ? AMBER : RULE,
              backgroundColor: relationship === rel ? "rgba(210,127,20,0.18)" : "transparent",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 13, color: relationship === rel ? AMBER_LIGHT : CREAM_DIM }}>{rel}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={nextStep}
        disabled={!recipient.trim()}
        style={({ pressed }) => ({
          backgroundColor: recipient.trim() ? AMBER : "rgba(210,127,20,0.25)",
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: AMBER,
          shadowOffset: { width: 0, height: recipient.trim() ? 8 : 0 },
          shadowOpacity: recipient.trim() ? 0.5 : 0,
          shadowRadius: 16,
          elevation: recipient.trim() ? 5 : 0,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: recipient.trim() ? "#FFFFFF" : "rgba(250,243,226,0.4)" }}>Continue</Text>
      </Pressable>
    </View>,

    // ── Step 1: Prompt ─────────────────────────────────────────────
    <View key="1">
      <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 26, color: CREAM, lineHeight: 34, marginBottom: 20 }}>A prompt to begin.</Text>

      <View style={{ backgroundColor: "rgba(210,127,20,0.12)", borderRadius: 18, padding: 28, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "rgba(210,127,20,0.2)" }}>
        <Text style={{ fontFamily: "Georgia", fontSize: 15, color: "rgba(250,243,226,0.7)", lineHeight: 22, textAlign: "center", marginBottom: 2 }}>{prompt.line1}</Text>
        <Text style={{ fontFamily: "Georgia", fontSize: 22, fontWeight: "600", color: CREAM, lineHeight: 28, textAlign: "center", marginBottom: 2 }}>{prompt.line2}</Text>
        <Text style={{ fontFamily: "Georgia", fontSize: 15, color: "rgba(250,243,226,0.7)", lineHeight: 22, textAlign: "center" }}>
          {prompt.line3.replace("Maya", recipient || "Maya")}
        </Text>
      </View>

      <Text style={{ fontSize: 13, color: CREAM_DIM, textAlign: "center", lineHeight: 19, marginBottom: 20 }}>
        Take a breath. You don't have to be eloquent — just{" "}
        <Text style={{ fontStyle: "italic" }}>you.</Text>
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 32 }}>
        <Pressable
          onPress={() => setPromptIdx((p) => (p + 1) % PROMPTS.length)}
          style={({ pressed }) => ({
            flex: 1,
            padding: 13,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: RULE,
            alignItems: "center",
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ fontSize: 13, color: CREAM_DIM }}>⤿  Shuffle prompt</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({
            flex: 1,
            padding: 13,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: RULE,
            alignItems: "center",
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ fontSize: 13, color: CREAM_DIM }}>✎  Write my own</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={nextStep}
        style={({ pressed }) => ({
          backgroundColor: AMBER,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: AMBER,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 5,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>I'm ready to record</Text>
      </Pressable>
    </View>,

    // ── Step 2: Mic check ──────────────────────────────────────────
    <View key="2" style={{ alignItems: "center" }}>
      <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 26, color: CREAM, lineHeight: 34, textAlign: "center", marginBottom: 24 }}>
        Say{" "}
        <Text style={{ color: AMBER }}>"hello, {recipient || "Maya"}"</Text>
        {"\n"}so we know we hear you.
      </Text>

      {/* Pulsing orb */}
      <Pressable style={{ marginBottom: 24 }}>
        <Animated.View style={{ transform: [{ scale: orbScale }] }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "rgba(210,127,20,0.2)", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, borderColor: "rgba(210,127,20,0.35)", alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: AMBER, alignItems: "center", justifyContent: "center", shadowColor: AMBER, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 }}>
                <Feather name="mic" size={28} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>

      {/* Caption preview */}
      <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, padding: 14, width: "100%", marginBottom: 20 }}>
        <Text style={{ fontSize: 8.5, fontWeight: "700", letterSpacing: 1.8, color: "rgba(250,243,226,0.4)", textTransform: "uppercase", marginBottom: 6 }}>CAPTIONS PREVIEW</Text>
        <Text style={{ fontSize: 13, color: CREAM_DIM, fontStyle: "italic" }}>— tap the mic to test —</Text>
      </View>

      <View style={{ gap: 8, width: "100%", marginBottom: 32 }}>
        {["Captions stay on, always.", "You can pause whenever you need to.", "You can re-record anything, anytime."].map((tip) => (
          <View key={tip} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: AMBER, marginTop: 5 }} />
            <Text style={{ fontSize: 13, color: CREAM_DIM, flex: 1, lineHeight: 20 }}>{tip}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={nextStep}
        style={({ pressed }) => ({
          width: "100%",
          backgroundColor: AMBER,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: AMBER,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 5,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>Sounds good</Text>
      </Pressable>
    </View>,

    // ── Step 3: Recording ──────────────────────────────────────────
    <View key="3">
      <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, padding: 14, marginBottom: 20, borderLeftWidth: 2, borderLeftColor: AMBER }}>
        <Text style={{ fontSize: 8.5, fontWeight: "700", letterSpacing: 1.8, color: "rgba(250,243,226,0.4)", textTransform: "uppercase", marginBottom: 5 }}>PROMPT</Text>
        <Text style={{ fontSize: 13, color: CREAM_DIM, lineHeight: 19 }}>
          {prompt.line1} {prompt.line2} {prompt.line3.replace("Maya", recipient || "Maya")}
        </Text>
      </View>

      {/* Waveform + timer */}
      <View style={{ backgroundColor: INPUT_BG, borderRadius: 16, paddingVertical: 20, marginBottom: 8, alignItems: "center" }}>
        <WaveformBars active={isRecording && !isPaused} />
        <Text style={{ fontFamily: "Georgia", fontSize: 48, color: AMBER, fontWeight: "300", marginTop: 14, letterSpacing: 2 }}>
          {formatTime(seconds)}
        </Text>
        <Text style={{ fontSize: 11.5, color: CREAM_DIM, marginTop: 4 }}>
          {!isRecording ? "Tap the dot to begin recording" : isPaused ? "Paused" : "Recording…"}
        </Text>
      </View>

      {/* Caption area */}
      <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, padding: 12, marginBottom: 20 }}>
        <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 13, color: CREAM_DIM, lineHeight: 19, textAlign: "center" }}>
          "…threading into vellum as you speak."
        </Text>
      </View>

      {/* Controls */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 28 }}>
        {/* Pause */}
        <Pressable
          onPress={() => setIsPaused((p) => !p)}
          disabled={!isRecording}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: isRecording ? CREAM_FAINT : "rgba(250,243,226,0.06)",
            alignItems: "center",
            justifyContent: "center",
            opacity: isRecording ? (pressed ? 0.75 : 1) : 0.3,
          })}
        >
          <Feather name={isPaused ? "play" : "pause"} size={18} color={CREAM} />
        </Pressable>

        {/* Record button */}
        <Pressable
          onPress={() => {
            if (!isRecording) { setIsRecording(true); setIsPaused(false); }
            else { setIsRecording(false); setSeconds(0); }
          }}
          style={({ pressed }) => ({
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isRecording ? TERRA : AMBER,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.88 : 1,
            borderWidth: 4,
            borderColor: isRecording ? "rgba(184,98,65,0.3)" : "rgba(210,127,20,0.3)",
            shadowColor: isRecording ? TERRA : AMBER,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.55,
            shadowRadius: 16,
            elevation: 8,
          })}
        >
          <View style={{ width: isRecording ? 22 : 18, height: isRecording ? 22 : 18, borderRadius: isRecording ? 5 : 9, backgroundColor: "#FFFFFF" }} />
        </Pressable>

        {/* Restart */}
        <Pressable
          onPress={() => { setIsRecording(false); setIsPaused(false); setSeconds(0); }}
          disabled={!isRecording && seconds === 0}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: CREAM_FAINT,
            alignItems: "center",
            justifyContent: "center",
            opacity: (isRecording || seconds > 0) ? (pressed ? 0.75 : 1) : 0.3,
          })}
        >
          <Feather name="rotate-ccw" size={17} color={CREAM} />
        </Pressable>
      </View>

      <Pressable
        onPress={nextStep}
        disabled={seconds === 0}
        style={({ pressed }) => ({
          backgroundColor: seconds > 0 ? AMBER : "rgba(210,127,20,0.25)",
          borderRadius: 14,
          paddingVertical: 15,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: AMBER,
          shadowOffset: { width: 0, height: seconds > 0 ? 6 : 0 },
          shadowOpacity: seconds > 0 ? 0.45 : 0,
          shadowRadius: 14,
          elevation: seconds > 0 ? 5 : 0,
        })}
      >
        <Text style={{ fontSize: 14.5, fontWeight: "600", color: seconds > 0 ? "#FFFFFF" : "rgba(250,243,226,0.35)" }}>Keep this one</Text>
      </Pressable>
    </View>,

    // ── Step 4: Seal ───────────────────────────────────────────────
    <View key="4" style={{ alignItems: "center" }}>
      <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 28, color: CREAM, lineHeight: 36, textAlign: "center", marginBottom: 24 }}>
        Sign your name.{"\n"}We'll{" "}
        <Text style={{ color: AMBER }}>set the wax.</Text>
      </Text>

      {/* Seal card */}
      <View style={{ width: "100%", backgroundColor: INPUT_BG, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: RULE, alignItems: "center", marginBottom: 24 }}>
        <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 2, color: "rgba(250,243,226,0.35)", textTransform: "uppercase", marginBottom: 12 }}>SIGNED BY</Text>
        <TextInput
          value={signature}
          onChangeText={setSignature}
          placeholder="Your full name"
          placeholderTextColor="rgba(250,243,226,0.2)"
          style={{ fontFamily: "Georgia", fontSize: 22, color: CREAM, borderBottomWidth: 1, borderBottomColor: RULE, width: "100%", textAlign: "center", paddingBottom: 10, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 11, color: "rgba(250,243,226,0.4)" }}>
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </Text>

        {/* Wax seal preview */}
        {isSealed && (
          <View style={{ marginTop: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: "#8A3A0E", alignItems: "center", justifyContent: "center", shadowColor: "#5E240A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 12, elevation: 6 }}>
            <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontWeight: "700", fontSize: 32, color: "#F3C896" }}>H</Text>
          </View>
        )}

        {!isSealed && <Text style={{ marginTop: 16, fontFamily: "Georgia", fontStyle: "italic", fontSize: 11.5, color: "rgba(250,243,226,0.38)", textAlign: "center" }}>
          A satisfying clunk when you press Seal.
        </Text>}
      </View>

      {/* Hold-to-seal button */}
      <Pressable
        onPressIn={onSealPressIn}
        onPressOut={onSealPressOut}
        disabled={!signature.trim() || isSealed}
        style={({ pressed }) => ({
          width: "100%",
          borderRadius: 14,
          overflow: "hidden",
          opacity: signature.trim() ? (pressed ? 0.88 : 1) : 0.4,
          marginBottom: 14,
        })}
      >
        <View style={{ backgroundColor: TERRA_DEEP, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: sealProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              backgroundColor: TERRA,
            }}
          />
          <Text style={{ fontSize: 14, color: "#F3C896", zIndex: 1 }}>✦</Text>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#F3C896", zIndex: 1 }}>
            {isSealed ? "Sealed ✓" : "Hold to Seal"}
          </Text>
        </View>
      </Pressable>

      <Text style={{ fontSize: 11.5, color: "rgba(250,243,226,0.35)", textAlign: "center", lineHeight: 17 }}>
        Only you (or whoever you name) can re-open it.
      </Text>
    </View>,

    // ── Step 5: Delivery ───────────────────────────────────────────
    <View key="5">
      <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 26, color: CREAM, lineHeight: 34, marginBottom: 24 }}>
        Pick the day{"\n"}this opens for{" "}
        <Text style={{ color: AMBER }}>{recipient || "Maya"}</Text>.
      </Text>

      <View style={{ gap: 10, marginBottom: 32 }}>
        {DELIVERY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => setDeliveryOption(opt.id)}
            style={({ pressed }) => ({
              backgroundColor: deliveryOption === opt.id ? "rgba(210,127,20,0.15)" : INPUT_BG,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1.5,
              borderColor: deliveryOption === opt.id ? AMBER : RULE,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: deliveryOption === opt.id ? AMBER_LIGHT : CREAM, marginBottom: 3 }}>{opt.label}</Text>
            <Text style={{ fontSize: 12, color: CREAM_DIM, lineHeight: 17 }}>{opt.sub}</Text>
            {opt.value && deliveryOption === opt.id && (
              <Text style={{ fontSize: 12, color: AMBER, marginTop: 6, fontWeight: "500" }}>{opt.value}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={nextStep}
        style={({ pressed }) => ({
          backgroundColor: AMBER,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: AMBER,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 5,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>Confirm</Text>
      </Pressable>
    </View>,

    // ── Step 6: Certificate ────────────────────────────────────────
    <View key="6" style={{ alignItems: "center" }}>
      <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 24, color: CREAM, lineHeight: 32, textAlign: "center", marginBottom: 8 }}>
        Your{" "}
        <Text style={{ color: AMBER }}>Certificate of Legacy</Text>
        {"\n"}is on its way.
      </Text>
      <Text style={{ fontSize: 12.5, color: CREAM_DIM, textAlign: "center", lineHeight: 19, marginBottom: 24 }}>
        A signed PDF — sent to your email in moments. Proof that this memory is now{" "}
        <Text style={{ fontStyle: "italic" }}>legally and digitally vaulted.</Text>
      </Text>

      {/* Certificate frame */}
      <Animated.View style={{ width: "100%", transform: [{ scale: certScale }], opacity: certOpacity, marginBottom: 28 }}>
        <View style={{ backgroundColor: "#FAF3E2", borderRadius: 4, padding: 24, borderWidth: 1, borderColor: "rgba(45,36,26,0.2)", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 }}>
          {/* Corner decorations */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
            <View key={i} style={{ position: "absolute", top: i < 2 ? 8 : undefined, bottom: i >= 2 ? 8 : undefined, left: i % 2 === 0 ? 8 : undefined, right: i % 2 === 1 ? 8 : undefined, width: 20, height: 20, borderTopWidth: i < 2 ? 1 : 0, borderBottomWidth: i >= 2 ? 1 : 0, borderLeftWidth: i % 2 === 0 ? 1 : 0, borderRightWidth: i % 2 === 1 ? 1 : 0, borderColor: "rgba(45,36,26,0.3)" }} />
          ))}

          <Text style={{ fontSize: 8, fontWeight: "700", letterSpacing: 3, textTransform: "uppercase", color: "rgba(45,36,26,0.5)", textAlign: "center", marginBottom: 6 }}>HEARTLOOM</Text>
          <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 14, color: "rgba(45,36,26,0.8)", textAlign: "center", marginBottom: 14, fontWeight: "500" }}>Certificate of Legacy</Text>

          <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.12)", marginBottom: 14 }} />

          <Text style={{ fontSize: 11, color: "rgba(45,36,26,0.55)", textAlign: "center", marginBottom: 4 }}>This is to certify that</Text>
          <Text style={{ fontFamily: "Georgia", fontSize: 20, fontWeight: "600", color: "#2D241A", textAlign: "center", marginBottom: 4 }}>{signature || "Eleanor M. Hayes"}</Text>
          <Text style={{ fontSize: 11, color: "rgba(45,36,26,0.55)", textAlign: "center", marginBottom: 4 }}>sealed a Future Letter for</Text>
          <Text style={{ fontFamily: "Georgia", fontSize: 18, fontWeight: "600", color: AMBER, textAlign: "center", marginBottom: 14 }}>{recipient || "Maya"}</Text>

          <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.08)", marginBottom: 12 }} />

          {[
            ["Delivery", DELIVERY_OPTIONS.find((o) => o.id === deliveryOption)?.label ?? "—"],
            ["Certificate", certId],
            ["Issued", new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
          ].map(([label, value]) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ fontSize: 10.5, color: "rgba(45,36,26,0.5)", letterSpacing: 0.5 }}>{label}</Text>
              <Text style={{ fontSize: 10.5, fontWeight: "600", color: "#2D241A" }}>{value}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={({ pressed }) => ({
          width: "100%",
          backgroundColor: AMBER,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: AMBER,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 5,
          marginBottom: 12,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>Back to Heartloom</Text>
      </Pressable>
      <Text style={{ fontSize: 11, color: "rgba(250,243,226,0.3)", textAlign: "center" }}>
        Check your email for the PDF certificate.
      </Text>
    </View>,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Ambient glow */}
      <View style={{ position: "absolute", top: -80, right: -80, width: 360, height: 280, borderRadius: 180, backgroundColor: "rgba(210,127,20,0.08)" }} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
          <Pressable onPress={prevStep} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
            <Text style={{ fontSize: 22, color: CREAM_DIM }}>‹</Text>
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 11, color: CREAM_DIM, fontWeight: "500" }}>
              {["Who is this for?", "Choose a prompt", "A quick mic check", "Recording", "The Seal", "When does this open?", "Your Certificate"][step]}
            </Text>
            <StepDots step={step} />
          </View>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
            <Feather name="x" size={18} color={CREAM_DIM} />
          </Pressable>
        </View>

        {/* Step content */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {Steps[step]}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
