import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Rect, Path, Circle, G, Text as SvgText, Defs, RadialGradient, LinearGradient, Stop } from "react-native-svg";
import { useAuthStore } from "../src/store/auth.store";
import WaveformBars from "../src/components/shared/WaveformBars";
import AnimatedPressable from "../src/components/ui/AnimatedPressable";
import useStepTransition from "../src/components/ui/useStepTransition";
import { useAudioRecorder } from "../src/hooks/useAudioRecorder";
import { useAudioPlayer } from "../src/hooks/useAudioPlayer";
import {
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";

// ─── Design tokens (light / parchment theme matching prototype) ───────────────
const BG = "#F5EDDF";
const CREAM = "#FAF3E2";
const TEXT = "#2D241A";
const INK_SOFT = "#4A3D2E";
const MUTED = "#8A7A66";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const RULE = "rgba(74,61,46,0.18)";
const CHIP_ON_BG = "rgba(210,127,20,0.12)";
const CHIP_ON_BORDER = AMBER;
const CHIP_OFF_BG = "rgba(45,36,26,0.05)";
const CHIP_OFF_BORDER = "rgba(74,61,46,0.22)";
const CARD_BG = "#FFFFFF";
const TERRA = "#8B4226";
const TERRA_BTN = "#6E3218";

const TOTAL_STEPS = 9;

const PROMPTS = [
  { line1: "If you could only leave", line2: "one piece of advice", line3: "for {name}…" },
  { line1: "Tell me about", line2: "the first home", line3: "you ever loved." },
  { line1: "What is one thing", line2: "you want them", line3: "to know forever?" },
  { line1: "Describe the moment", line2: "you became", line3: "yourself." },
];

const RELATIONSHIPS = ["Granddaughter", "Daughter", "Son", "Partner", "Friend", "Other"];

const DELIVERY_OPTIONS = [
  { id: "date", title: "On a specific date", sub: "Birthday, anniversary, graduation", value: "June 14, 2034" },
  { id: "milestone", title: "On a milestone", sub: "" },
  { id: "ask", title: "Whenever {name} asks", sub: "She'll be told it exists, on a day you choose." },
  { id: "now", title: "Right now", sub: "Some letters shouldn't wait." },
];

// ─── Wax Seal SVG ────────────────────────────────────────────────────────────
function WaxSeal({ size = 140 }: { size?: number }) {
  const s = size;
  return (
    <Svg viewBox="0 0 140 140" width={s} height={s}>
      <Defs>
        <RadialGradient id="waxFill" cx="36%" cy="28%" r="82%">
          <Stop offset="0%" stopColor="#e9b870" />
          <Stop offset="22%" stopColor="#c98244" />
          <Stop offset="55%" stopColor="#8b4a1c" />
          <Stop offset="82%" stopColor="#5e2c0e" />
          <Stop offset="100%" stopColor="#3a1a06" />
        </RadialGradient>
        <RadialGradient id="waxGlow" cx="32%" cy="26%" r="36%">
          <Stop offset="0%" stopColor="rgba(255,228,170,0.95)" />
          <Stop offset="60%" stopColor="rgba(255,228,170,0.18)" />
          <Stop offset="100%" stopColor="rgba(255,228,170,0)" />
        </RadialGradient>
        <RadialGradient id="waxShadow" cx="62%" cy="82%" r="58%">
          <Stop offset="0%" stopColor="rgba(28,10,2,0.75)" />
          <Stop offset="100%" stopColor="rgba(28,10,2,0)" />
        </RadialGradient>
        <LinearGradient id="waxRim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#f3c98a" />
          <Stop offset="100%" stopColor="#7a4015" />
        </LinearGradient>
      </Defs>
      <Path
        d="M70 6 l6 6 8-2 4 8 8 2 1 9 8 5-2 9 6 7-5 7 4 9-7 5 1 9-9 3-2 9-9-1-5 7-8-4-7 4-5-7-9 1-2-9-9-3 1-9-7-5 4-9-5-7 6-7-2-9 8-5 1-9 8-2 4-8 8 2z"
        fill="url(#waxFill)"
      />
      <Path
        d="M70 6 l6 6 8-2 4 8 8 2 1 9 8 5-2 9 6 7-5 7 4 9-7 5 1 9-9 3-2 9-9-1-5 7-8-4-7 4-5-7-9 1-2-9-9-3 1-9-7-5 4-9-5-7 6-7-2-9 8-5 1-9 8-2 4-8 8 2z"
        fill="url(#waxShadow)"
      />
      <Path
        d="M70 6 l6 6 8-2 4 8 8 2 1 9 8 5-2 9 6 7-5 7 4 9-7 5 1 9-9 3-2 9-9-1-5 7-8-4-7 4-5-7-9 1-2-9-9-3 1-9-7-5 4-9-5-7 6-7-2-9 8-5 1-9 8-2 4-8 8 2z"
        fill="url(#waxGlow)"
        opacity={0.7}
      />
      <Path
        d="M70 6 l6 6 8-2 4 8 8 2 1 9 8 5-2 9 6 7-5 7 4 9-7 5 1 9-9 3-2 9-9-1-5 7-8-4-7 4-5-7-9 1-2-9-9-3 1-9-7-5 4-9-5-7 6-7-2-9 8-5 1-9 8-2 4-8 8 2z"
        fill="none"
        stroke="url(#waxRim)"
        strokeWidth={0.7}
        opacity={0.75}
      />
      <Circle cx={70} cy={70} r={46} fill="none" stroke="rgba(255,228,180,0.32)" strokeWidth={0.6} />
      <Circle cx={70} cy={70} r={42} fill="none" stroke="rgba(60,24,6,0.45)" strokeWidth={0.5} strokeDasharray="1.6 2.6" />
      <G fill="rgba(255,228,180,0.55)">
        <Circle cx={70} cy={26} r={1.4} />
        <Circle cx={114} cy={70} r={1.4} />
        <Circle cx={70} cy={114} r={1.4} />
        <Circle cx={26} cy={70} r={1.4} />
      </G>
      <G transform="translate(70, 70)">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SvgText
          textAnchor="middle"
          {...({ dominantBaseline: "central" } as any)}
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize={56}
          fill="#fff1d4"
          stroke="rgba(54,22,5,0.45)"
          strokeWidth={0.6}
        >
          H
        </SvgText>
      </G>
    </Svg>
  );
}

// ─── Small wax seal for certificate ──────────────────────────────────────────
function SmallWaxSeal({ size = 80 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 80 80" width={size} height={size}>
      <Defs>
        <RadialGradient id="certWax" cx="36%" cy="28%" r="82%">
          <Stop offset="0%" stopColor="#e9b870" />
          <Stop offset="22%" stopColor="#c98244" />
          <Stop offset="55%" stopColor="#8b4a1c" />
          <Stop offset="82%" stopColor="#5e2c0e" />
          <Stop offset="100%" stopColor="#3a1a06" />
        </RadialGradient>
      </Defs>
      <Circle cx={40} cy={40} r={32} fill="url(#certWax)" />
      <Circle cx={40} cy={40} r={27} fill="none" stroke="rgba(255,228,180,0.35)" strokeWidth={0.5} />
      <Circle cx={40} cy={40} r={24} fill="none" stroke="rgba(60,24,6,0.45)" strokeWidth={0.4} strokeDasharray="1.4 2.2" />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SvgText
        x={40}
        y={40}
        textAnchor="middle"
        {...({ dominantBaseline: "central" } as any)}
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize={34}
        fill="#fff1d4"
      >
        H
      </SvgText>
    </Svg>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryBtn({
  label,
  onPress,
  disabled,
  terra,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  terra?: boolean;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: terra ? TERRA_BTN : disabled ? "rgba(210,127,20,0.3)" : AMBER,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: terra ? TERRA_BTN : AMBER,
        shadowOffset: { width: 0, height: disabled ? 0 : 6 },
        shadowOpacity: disabled ? 0 : 0.35,
        shadowRadius: 12,
        elevation: disabled ? 0 : 4,
        marginTop: 4,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: disabled ? "rgba(255,255,255,0.45)" : "#FFFFFF",
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Ghost button ─────────────────────────────────────────────────────────────
function GhostBtn({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: RULE,
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <Text style={{ fontSize: 13.5, color: INK_SOFT }}>{label}</Text>
    </AnimatedPressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RecordScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);

  // Step 0 – Recipient
  const [recipient, setRecipient] = useState("Maya");
  const [relationship, setRelationship] = useState("Granddaughter");

  // Step 1 – Seed
  const [promptIdx, setPromptIdx] = useState(0);

  // Step 3 – Recording (real audio)
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordingUri,
    meteringLevel,
    meteringDb,
    seconds,
    isRecording,
    isPaused,
    permissionDenied,
    lastError,
  } = useAudioRecorder();
  const [hasRecording, setHasRecording] = useState(false);

  // Step 4 – Review (real audio player)
  const { play, pause, isPlaying, positionMs, durationMs, progress: playProgressValue } = useAudioPlayer(recordingUri);
  const playProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playProgress.setValue(playProgressValue);
  }, [playProgressValue]);

  // Step 5 – Seal
  const [signature, setSignature] = useState("Eleanor M. Hayes");
  const [isSealed, setIsSealed] = useState(false);
  const sealProgress = useRef(new Animated.Value(0)).current;
  const sealScale = useRef(new Animated.Value(1)).current;

  // Step 6 – Deliver
  const [deliveryOption, setDeliveryOption] = useState("date");

  // Step 7 – Certificate
  const certScale = useRef(new Animated.Value(0.88)).current;
  const certOpacity = useRef(new Animated.Value(0)).current;

  // Orb pulse (Step 2)
  const orbPulse1 = useRef(new Animated.Value(1)).current;
  const orbPulse2 = useRef(new Animated.Value(1)).current;
  const orbPulse3 = useRef(new Animated.Value(1)).current;

  // Slide+fade step transitions
  const { fadeAnim, slideAnim, transitionForward, transitionBack, animatedStyle } = useStepTransition();

  const certNo = useMemo(
    () => `HL-2026-${Math.floor(10000 + Math.random() * 90000)} · sha256 a47f…0b21`,
    []
  );
  const sealDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  // Orb pulse on mic check step
  useEffect(() => {
    if (step !== 2) return;
    function loopPulse(anim: Animated.Value, delay: number, scale: number) {
      setTimeout(() => {
        function go() {
          Animated.sequence([
            Animated.timing(anim, { toValue: scale, duration: 900, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]).start(go);
        }
        go();
      }, delay);
    }
    loopPulse(orbPulse1, 0, 1.18);
    loopPulse(orbPulse2, 300, 1.32);
    loopPulse(orbPulse3, 600, 1.48);
    return () => {
      orbPulse1.stopAnimation();
      orbPulse2.stopAnimation();
      orbPulse3.stopAnimation();
    };
  }, [step]);

  // Certificate animation
  useEffect(() => {
    if (step !== 7) return;
    Animated.parallel([
      Animated.spring(certScale, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
      Animated.timing(certOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [step]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function goNext() {
    transitionForward(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)));
  }

  function goPrev() {
    if (step === 0) {
      router.back();
      return;
    }
    transitionBack(() => setStep((s) => Math.max(s - 1, 0)));
  }

  function onSealPressIn() {
    sealProgress.setValue(0);
    Animated.timing(sealProgress, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setIsSealed(true);
        setTimeout(() => goNext(), 700);
      }
    });
  }

  function onSealPressOut() {
    sealProgress.stopAnimation();
    if (!isSealed) sealProgress.setValue(0);
  }

  const name = recipient.trim() || "Maya";
  const prompt = PROMPTS[promptIdx];

  const STEP_HEADERS: Array<{ title: string; step: string }> = [
    { title: "Who is this for?", step: "2 / 9" },
    { title: "The Seed · 0–2 min", step: "3 / 9" },
    { title: "A quick mic check", step: "4 / 9" },
    { title: "Recording · 2–8 min", step: "5 / 9" },
    { title: "A gentle review", step: "6 / 9" },
    { title: "The Seal · minute 9", step: "7 / 9" },
    { title: "When does this open?", step: "8 / 9" },
    { title: "Minute 10 · Your Certificate", step: "9 / 9" },
  ];

  const header = STEP_HEADERS[Math.min(step, STEP_HEADERS.length - 1)];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 6,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: RULE,
          }}
        >
          <Pressable
            onPress={goPrev}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              padding: 4,
              minWidth: 32,
            })}
          >
            <Text
              style={{
                fontSize: 24,
                color: TEXT,
                lineHeight: 28,
                fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
              }}
            >
              ‹
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: INK_SOFT,
              flex: 1,
              textAlign: "center",
              paddingHorizontal: 8,
            }}
            numberOfLines={1}
          >
            {header.title}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: MUTED,
              minWidth: 32,
              textAlign: "right",
              fontVariant: ["tabular-nums"],
            }}
          >
            {header.step}
          </Text>
        </View>

        {/* ── Step content ── */}
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 48,
            }}
          >
            {step === 0 && (
              <StepRecipient
                recipient={recipient}
                setRecipient={setRecipient}
                relationship={relationship}
                setRelationship={setRelationship}
                onNext={goNext}
              />
            )}
            {step === 1 && (
              <StepSeed
                name={name}
                prompt={prompt}
                promptIdx={promptIdx}
                onShuffle={() => setPromptIdx((i) => (i + 1) % PROMPTS.length)}
                onNext={goNext}
              />
            )}
            {step === 2 && (
              <StepMicCheck
                name={name}
                orbPulse1={orbPulse1}
                orbPulse2={orbPulse2}
                orbPulse3={orbPulse3}
                onNext={goNext}
              />
            )}
            {step === 3 && (
              <StepRecording
                name={name}
                prompt={prompt}
                isRecording={isRecording}
                isPaused={isPaused}
                seconds={seconds}
                hasRecording={hasRecording}
                meteringLevel={meteringLevel}
                meteringDb={meteringDb}
                permissionDenied={permissionDenied}
                lastError={lastError}
                formatTime={formatTime}
                onStart={startRecording}
                onStop={async () => {
                  await stopRecording();
                  setHasRecording(true);
                }}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onRestart={async () => {
                  await stopRecording();
                  setHasRecording(false);
                }}
                onNext={goNext}
              />
            )}
            {step === 4 && (
              <StepReview
                name={name}
                seconds={durationMs > 0 ? Math.floor(durationMs / 1000) : seconds}
                positionMs={positionMs}
                durationMs={durationMs}
                isPlaying={isPlaying}
                playProgress={playProgress}
                formatTime={formatTime}
                onPlay={play}
                onPause={pause}
                onReRecord={async () => {
                  await stopRecording();
                  setHasRecording(false);
                  setStep(3);
                }}
                onNext={goNext}
              />
            )}
            {step === 5 && (
              <StepSeal
                signature={signature}
                setSignature={setSignature}
                isSealed={isSealed}
                sealDate={sealDate}
                sealProgress={sealProgress}
                sealScale={sealScale}
                onPressIn={onSealPressIn}
                onPressOut={onSealPressOut}
              />
            )}
            {step === 6 && (
              <StepDeliver
                name={name}
                deliveryOption={deliveryOption}
                setDeliveryOption={setDeliveryOption}
                onNext={goNext}
              />
            )}
            {step === 7 && (
              <StepCertificate
                name={name}
                signature={signature}
                sealDate={sealDate}
                certNo={certNo}
                certScale={certScale}
                certOpacity={certOpacity}
                onDone={() =>
                  user
                    ? router.replace("/(tabs)")
                    : router.replace("/(auth)/sign-up")
                }
                isAuthenticated={!!user}
              />
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Step 0: Recipient ────────────────────────────────────────────────────────
function StepRecipient({
  recipient,
  setRecipient,
  relationship,
  setRelationship,
  onNext,
}: {
  recipient: string;
  setRecipient: (v: string) => void;
  relationship: string;
  setRelationship: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 30,
          color: TEXT,
          lineHeight: 40,
          marginBottom: 10,
          fontWeight: "400",
        }}
      >
        Name one person{"\n"}you're recording{" "}
        <Text style={{ fontStyle: "italic" }}>for.</Text>
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: MUTED,
          lineHeight: 21,
          marginBottom: 28,
        }}
      >
        You can add more later. Start with the one that's been on your mind.
      </Text>

      <View style={{ marginBottom: 4 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "600",
            letterSpacing: 1.4,
            color: MUTED,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Their name
        </Text>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Maya"
          placeholderTextColor="rgba(74,61,46,0.28)"
          style={{
            fontFamily: "Georgia",
            fontSize: 20,
            color: TEXT,
            borderBottomWidth: 1.5,
            borderBottomColor: "rgba(74,61,46,0.2)",
            paddingBottom: 10,
            paddingTop: 0,
          }}
          autoFocus
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          color: MUTED,
          marginBottom: 28,
        }}
      >
        First name is enough.
      </Text>

      <Text
        style={{
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 1.4,
          color: MUTED,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Your relationship
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 36 }}
      >
        {RELATIONSHIPS.map((rel) => {
          const on = relationship === rel;
          return (
            <AnimatedPressable
              key={rel}
              onPress={() => setRelationship(rel)}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 9,
                borderRadius: 999,
                borderWidth: 1.5,
                borderColor: on ? CHIP_ON_BORDER : CHIP_OFF_BORDER,
                backgroundColor: on ? CHIP_ON_BG : CHIP_OFF_BG,
              }}
            >
              <Text
                style={{
                  fontSize: 13.5,
                  color: on ? AMBER_DEEP : INK_SOFT,
                  fontWeight: on ? "600" : "400",
                }}
              >
                {rel}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <PrimaryBtn label="Continue" onPress={onNext} disabled={!recipient.trim()} />
    </View>
  );
}

// ─── Step 1: Seed ─────────────────────────────────────────────────────────────
function StepSeed({
  name,
  prompt,
  promptIdx,
  onShuffle,
  onNext,
}: {
  name: string;
  prompt: (typeof PROMPTS)[0];
  promptIdx: number;
  onShuffle: () => void;
  onNext: () => void;
}) {
  const line3 = prompt.line3.replace("{name}", name);
  return (
    <View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 28,
          color: TEXT,
          lineHeight: 36,
          marginBottom: 24,
        }}
      >
        A prompt to begin.
      </Text>

      <View
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 16,
          padding: 28,
          alignItems: "center",
          marginBottom: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: RULE,
        }}
      >
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 15,
            color: MUTED,
            lineHeight: 22,
            textAlign: "center",
            marginBottom: 2,
          }}
        >
          {prompt.line1}
        </Text>
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 22,
            fontWeight: "600",
            color: TEXT,
            lineHeight: 30,
            textAlign: "center",
            marginBottom: 2,
          }}
        >
          {prompt.line2}
        </Text>
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 15,
            color: MUTED,
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          {line3}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: INK_SOFT,
          textAlign: "center",
          lineHeight: 21,
          marginBottom: 20,
        }}
      >
        Take a breath. You don't have to be eloquent — just{" "}
        <Text style={{ fontStyle: "italic" }}>you.</Text>
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <GhostBtn label="⤿  Shuffle prompt" onPress={onShuffle} />
        <GhostBtn label="✎  Write my own" />
      </View>

      <PrimaryBtn label="I'm ready to record" onPress={onNext} />
    </View>
  );
}

// ─── Step 2: Mic check ────────────────────────────────────────────────────────
function StepMicCheck({
  name,
  orbPulse1,
  orbPulse2,
  orbPulse3,
  onNext,
}: {
  name: string;
  orbPulse1: Animated.Value;
  orbPulse2: Animated.Value;
  orbPulse3: Animated.Value;
  onNext: () => void;
}) {
  const options = useMemo(
    () => ({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true }),
    []
  );
  const recorder = useExpoAudioRecorder(options);
  const state = useAudioRecorderState(recorder, 50);

  const [testing, setTesting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meteringLevel =
    typeof state.metering === "number" && !Number.isNaN(state.metering)
      ? Math.max(0, Math.min(1, (state.metering + 60) / 60))
      : 0;

  async function handleOrbPress() {
    if (testing) return;
    setTesting(true);
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setTesting(false);
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      timerRef.current = setTimeout(async () => {
        try {
          await recorder.stop();
          await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
        } catch {
          // already stopped
        }
        setTesting(false);
      }, 3000);
    } catch {
      setTesting(false);
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={{ alignItems: "center" }}>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 26,
          color: TEXT,
          lineHeight: 36,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        Say{" "}
        <Text style={{ fontStyle: "italic" }}>
          "hello, {name}"
        </Text>
        {"\n"}so we know we hear you.
      </Text>

      {/* Pulsing orb — tap to test mic */}
      <Pressable onPress={handleOrbPress} style={{ marginBottom: 32, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={{
            width: 136,
            height: 136,
            borderRadius: 68,
            backgroundColor: "rgba(210,127,20,0.07)",
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: orbPulse3 }],
          }}
        >
          <Animated.View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "rgba(210,127,20,0.1)",
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: orbPulse2 }],
            }}
          >
            <Animated.View
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: testing ? "#B04020" : AMBER,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: AMBER,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.45,
                shadowRadius: 16,
                elevation: 8,
                transform: [{ scale: orbPulse1 }],
              }}
            >
              <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#FFFFFF" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <Rect x={9} y={3} width={6} height={11} rx={3} fill="none" stroke="#FFFFFF" strokeWidth={1.7} />
                <Path d="M5 11a7 7 0 0 0 14 0" stroke="#FFFFFF" strokeWidth={1.7} />
                <Path d="M12 18v3" stroke="#FFFFFF" strokeWidth={1.7} />
              </Svg>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Caption preview — shows waveform when testing, placeholder otherwise */}
      <View
        style={{
          width: "100%",
          backgroundColor: "rgba(45,36,26,0.05)",
          borderRadius: 12,
          padding: 14,
          marginBottom: 22,
          borderWidth: 1,
          borderColor: RULE,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 1.8,
            color: MUTED,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {testing ? "LISTENING…" : "CAPTIONS PREVIEW"}
        </Text>
        {testing ? (
          <WaveformBars active={true} meteringLevel={meteringLevel} />
        ) : (
          <Text
            style={{
              fontSize: 14,
              color: MUTED,
              fontStyle: "italic",
              lineHeight: 20,
            }}
          >
            — tap the mic to test —
          </Text>
        )}
      </View>

      <View style={{ width: "100%", gap: 10, marginBottom: 32 }}>
        {[
          "Captions stay on, always.",
          "You can pause whenever you need to.",
          "You can re-record anything, anytime.",
        ].map((tip) => (
          <View key={tip} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: AMBER,
                marginTop: 7,
              }}
            />
            <Text style={{ fontSize: 13.5, color: INK_SOFT, flex: 1, lineHeight: 20 }}>
              {tip}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ width: "100%" }}>
        <PrimaryBtn label="Sounds good" onPress={onNext} />
      </View>
    </View>
  );
}

// ─── Step 3: Recording ────────────────────────────────────────────────────────
function StepRecording({
  name,
  prompt,
  isRecording,
  isPaused,
  seconds,
  hasRecording,
  meteringLevel,
  meteringDb,
  permissionDenied,
  lastError,
  formatTime,
  onStart,
  onStop,
  onPause,
  onResume,
  onRestart,
  onNext,
}: {
  name: string;
  prompt: (typeof PROMPTS)[0];
  isRecording: boolean;
  isPaused: boolean;
  seconds: number;
  hasRecording: boolean;
  meteringLevel: number;
  meteringDb: number | null;
  permissionDenied: boolean;
  lastError: string | null;
  formatTime: (s: number) => string;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onRestart: () => Promise<void>;
  onNext: () => void;
}) {
  const line3 = prompt.line3.replace("{name}", name);

  return (
    <View>
      {/* Prompt banner */}
      <View
        style={{
          backgroundColor: "rgba(45,36,26,0.05)",
          borderRadius: 12,
          padding: 14,
          marginBottom: 20,
          borderLeftWidth: 2.5,
          borderLeftColor: AMBER,
          borderWidth: 1,
          borderColor: RULE,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 1.8,
            color: MUTED,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          PROMPT
        </Text>
        <Text style={{ fontSize: 14, color: INK_SOFT, lineHeight: 21 }}>
          {prompt.line1} {prompt.line2} {line3}
        </Text>
      </View>

      {/* Waveform stage */}
      <View
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 16,
          paddingVertical: 22,
          paddingHorizontal: 12,
          marginBottom: 10,
          alignItems: "center",
          borderWidth: 1,
          borderColor: RULE,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <WaveformBars active={isRecording && !isPaused} meteringLevel={meteringLevel} />
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 44,
            color: isRecording ? AMBER : MUTED,
            fontWeight: "300",
            marginTop: 12,
            letterSpacing: 3,
          }}
        >
          {formatTime(seconds)}
        </Text>
        <Text style={{ fontSize: 12, color: permissionDenied ? "#B04020" : MUTED, marginTop: 4 }}>
          {permissionDenied
            ? "Microphone permission denied — check Settings"
            : !isRecording
            ? "Tap the dot to begin recording"
            : isPaused
            ? "Paused"
            : "Recording…"}
        </Text>
        {/* DEBUG: shows live metering values so you can see what the mic is feeding the waveform */}
        <Text style={{ fontSize: 10, color: MUTED, marginTop: 4, fontVariant: ["tabular-nums"] }}>
          {isRecording
            ? `dB: ${meteringDb === null ? "—" : meteringDb.toFixed(1)}   level: ${meteringLevel.toFixed(2)}`
            : lastError
            ? `err: ${lastError}`
            : " "}
        </Text>
      </View>

      {/* Caption area */}
      <View
        style={{
          backgroundColor: "rgba(45,36,26,0.04)",
          borderRadius: 12,
          padding: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: RULE,
          minHeight: 46,
        }}
      >
        <Text
          style={{
            fontFamily: "Georgia",
            fontStyle: "italic",
            fontSize: 14,
            color: MUTED,
            lineHeight: 21,
            textAlign: "center",
          }}
        >
          "…"
        </Text>
      </View>

      {/* Controls */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          marginBottom: 24,
        }}
      >
        {/* Pause/resume */}
        <Pressable
          onPress={() => isPaused ? onResume() : onPause()}
          disabled={!isRecording}
          style={({ pressed }) => ({
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: "rgba(45,36,26,0.08)",
            alignItems: "center",
            justifyContent: "center",
            opacity: isRecording ? (pressed ? 0.7 : 1) : 0.3,
          })}
        >
          <Svg viewBox="0 0 24 24" width={20} height={20} fill={TEXT}>
            {isPaused ? (
              <Path d="M8 5l11 7-11 7V5z" fill={TEXT} />
            ) : (
              <>
                <Rect x={6} y={5} width={4} height={14} rx={1} fill={TEXT} />
                <Rect x={14} y={5} width={4} height={14} rx={1} fill={TEXT} />
              </>
            )}
          </Svg>
        </Pressable>

        {/* Record button */}
        <Pressable
          onPress={() => {
            if (!isRecording) {
              onStart();
            } else {
              onStop();
            }
          }}
          style={({ pressed }) => ({
            width: 78,
            height: 78,
            borderRadius: 39,
            backgroundColor: isRecording ? "#B04020" : AMBER,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.88 : 1,
            borderWidth: 4,
            borderColor: isRecording
              ? "rgba(176,64,32,0.28)"
              : "rgba(210,127,20,0.25)",
            shadowColor: isRecording ? "#B04020" : AMBER,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 6,
          })}
        >
          <View
            style={{
              width: isRecording ? 20 : 16,
              height: isRecording ? 20 : 16,
              borderRadius: isRecording ? 4 : 8,
              backgroundColor: "#FFFFFF",
            }}
          />
        </Pressable>

        {/* Restart */}
        <Pressable
          onPress={onRestart}
          disabled={!isRecording && seconds === 0}
          style={({ pressed }) => ({
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: "rgba(45,36,26,0.08)",
            alignItems: "center",
            justifyContent: "center",
            opacity: isRecording || seconds > 0 ? (pressed ? 0.7 : 1) : 0.3,
          })}
        >
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={TEXT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 12a8 8 0 1 0 3-6.2" />
            <Path d="M4 4v5h5" />
          </Svg>
        </Pressable>
      </View>

      <Text
        style={{
          fontSize: 12,
          color: MUTED,
          textAlign: "center",
          marginBottom: 20,
          fontStyle: "italic",
        }}
      >
        Threading into vellum as you speak.
      </Text>

      {hasRecording && (
        <PrimaryBtn label="Keep this one" onPress={onNext} />
      )}
    </View>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────
function StepReview({
  name,
  seconds,
  positionMs,
  durationMs,
  isPlaying,
  playProgress,
  formatTime,
  onPlay,
  onPause,
  onReRecord,
  onNext,
}: {
  name: string;
  seconds: number;
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  playProgress: Animated.Value;
  formatTime: (s: number) => string;
  onPlay: () => Promise<void>;
  onPause: () => Promise<void>;
  onReRecord: () => Promise<void>;
  onNext: () => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 28,
          color: TEXT,
          lineHeight: 38,
          marginBottom: 24,
        }}
      >
        Listen back.{"\n"}
        <Text style={{ fontStyle: "italic" }}>Or don't.</Text> It's already safe.
      </Text>

      <View
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: RULE,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 28,
              fontWeight: "300",
              color: TEXT,
              letterSpacing: 1,
            }}
          >
            {formatTime(Math.floor(positionMs / 1000))} / {formatTime(seconds || Math.floor(durationMs / 1000))}
          </Text>
          <View
            style={{
              backgroundColor: "rgba(45,36,26,0.08)",
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 1.5,
                color: INK_SOFT,
                textTransform: "uppercase",
              }}
            >
              FOR {name.toUpperCase()} · DRAFT
            </Text>
          </View>
        </View>

        {/* Play button */}
        <Pressable
          onPress={() => isPlaying ? onPause() : onPlay()}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: AMBER,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: AMBER,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.38,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 16, color: "#FFFFFF", marginLeft: isPlaying ? 0 : 2 }}>
              {isPlaying ? "⏸" : "▶"}
            </Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: "600", color: INK_SOFT }}>
            {isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>

        {/* Progress bar */}
        <View
          style={{
            height: 4,
            backgroundColor: "rgba(45,36,26,0.1)",
            borderRadius: 2,
            marginBottom: 16,
          }}
        >
          <Animated.View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: AMBER,
              width: playProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>

        {/* Transcript snippet */}
        <Text
          style={{
            fontFamily: "Georgia",
            fontStyle: "italic",
            fontSize: 13.5,
            color: INK_SOFT,
            lineHeight: 21,
            marginBottom: 12,
          }}
        >
          "…the only thing I'd want you to remember is that you are{" "}
          <Text style={{ fontStyle: "normal", fontWeight: "600" }}>allowed</Text>{" "}
          to be tired…"
        </Text>

        <Pressable>
          <Text
            style={{
              fontSize: 12.5,
              color: AMBER_DEEP,
              fontWeight: "600",
              textDecorationLine: "underline",
            }}
          >
            Read full transcript
          </Text>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <GhostBtn label="Re-record" onPress={onReRecord} />
        <View style={{ flex: 1 }}>
          <PrimaryBtn label="Keep this one" onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

// ─── Step 5: Seal ─────────────────────────────────────────────────────────────
function StepSeal({
  signature,
  setSignature,
  isSealed,
  sealDate,
  sealProgress,
  sealScale,
  onPressIn,
  onPressOut,
}: {
  signature: string;
  setSignature: (v: string) => void;
  isSealed: boolean;
  sealDate: string;
  sealProgress: Animated.Value;
  sealScale: Animated.Value;
  onPressIn: () => void;
  onPressOut: () => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 28,
          color: TEXT,
          lineHeight: 38,
          marginBottom: 24,
        }}
      >
        Sign your name.{"\n"}We'll{" "}
        <Text style={{ fontStyle: "italic" }}>set the wax.</Text>
      </Text>

      <View
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 16,
          padding: 22,
          marginBottom: 24,
          alignItems: "center",
          borderWidth: 1,
          borderColor: RULE,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 2,
            color: MUTED,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          SIGNED BY
        </Text>

        <TextInput
          value={signature}
          onChangeText={setSignature}
          placeholder="Your full name"
          placeholderTextColor="rgba(74,61,46,0.28)"
          style={{
            fontFamily: "Georgia",
            fontSize: 22,
            color: TEXT,
            borderBottomWidth: 1.5,
            borderBottomColor: "rgba(74,61,46,0.18)",
            width: "100%",
            textAlign: "center",
            paddingBottom: 10,
            marginBottom: 14,
          }}
        />

        <Text style={{ fontSize: 12, color: MUTED, marginBottom: 18 }}>
          {sealDate}
        </Text>

        <View style={{ marginBottom: 8 }}>
          <WaxSeal size={120} />
        </View>

        {!isSealed && (
          <Text
            style={{
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 12,
              color: MUTED,
              textAlign: "center",
            }}
          >
            A satisfying clunk when you press Seal.
          </Text>
        )}
      </View>

      {/* Hold-to-seal button */}
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={!signature.trim() || isSealed}
        style={({ pressed }) => ({
          borderRadius: 12,
          overflow: "hidden",
          opacity: signature.trim() ? (pressed ? 0.9 : 1) : 0.4,
          marginBottom: 14,
        })}
      >
        <View
          style={{
            backgroundColor: TERRA_BTN,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: TERRA,
              width: sealProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
          <Text style={{ fontSize: 15, color: "#F3C896", zIndex: 1 }}>✦</Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#F3C896",
              zIndex: 1,
            }}
          >
            {isSealed ? "Sealed ✓" : "Seal it"}
          </Text>
        </View>
      </Pressable>

      <Text
        style={{
          fontSize: 12,
          color: MUTED,
          textAlign: "center",
          lineHeight: 18,
        }}
      >
        Only you (or whoever you name) can re-open it.
      </Text>
    </View>
  );
}

// ─── Step 6: Deliver ──────────────────────────────────────────────────────────
function StepDeliver({
  name,
  deliveryOption,
  setDeliveryOption,
  onNext,
}: {
  name: string;
  deliveryOption: string;
  setDeliveryOption: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 28,
          color: TEXT,
          lineHeight: 38,
          marginBottom: 28,
        }}
      >
        Pick the day{"\n"}this opens for {name}.
      </Text>

      <View style={{ gap: 10, marginBottom: 32 }}>
        {DELIVERY_OPTIONS.map((opt) => {
          const on = deliveryOption === opt.id;
          const title = opt.title.replace("{name}", name);
          const sub =
            opt.id === "milestone"
              ? `"When ${name} gets engaged"`
              : opt.sub;
          return (
            <AnimatedPressable
              key={opt.id}
              onPress={() => setDeliveryOption(opt.id)}
              style={{
                backgroundColor: on ? CHIP_ON_BG : CARD_BG,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1.5,
                borderColor: on ? CHIP_ON_BORDER : RULE,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: on ? 2 : 1 },
                shadowOpacity: on ? 0.06 : 0.03,
                shadowRadius: 6,
                elevation: on ? 2 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 14.5,
                  fontWeight: "600",
                  color: on ? AMBER_DEEP : TEXT,
                  marginBottom: 4,
                }}
              >
                {title}
              </Text>
              {sub ? (
                <Text style={{ fontSize: 13, color: MUTED, lineHeight: 19 }}>
                  {sub}
                </Text>
              ) : null}
              {opt.value && on && (
                <Text
                  style={{
                    fontSize: 13,
                    color: AMBER,
                    marginTop: 8,
                    fontWeight: "500",
                  }}
                >
                  {opt.value}
                </Text>
              )}
            </AnimatedPressable>
          );
        })}
      </View>

      <PrimaryBtn label="Confirm" onPress={onNext} />
    </View>
  );
}

// ─── Step 7: Certificate ──────────────────────────────────────────────────────
function StepCertificate({
  name,
  signature,
  sealDate,
  certNo,
  certScale,
  certOpacity,
  onDone,
  isAuthenticated,
}: {
  name: string;
  signature: string;
  sealDate: string;
  certNo: string;
  certScale: Animated.Value;
  certOpacity: Animated.Value;
  onDone: () => void;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const sig = signature || "Eleanor M. Hayes";

  return (
    <View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 27,
          color: TEXT,
          lineHeight: 36,
          marginBottom: 10,
        }}
      >
        Your <Text style={{ fontStyle: "italic" }}>Certificate of Legacy</Text>
        {"\n"}is on its way.
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: INK_SOFT,
          lineHeight: 21,
          marginBottom: 28,
        }}
      >
        A signed PDF — sent to your email in moments. Proof that this memory is
        now{" "}
        <Text style={{ fontStyle: "italic" }}>legally and digitally vaulted.</Text>
      </Text>

      {/* Certificate frame */}
      <Animated.View
        style={{
          transform: [{ scale: certScale }],
          opacity: certOpacity,
          marginBottom: 28,
        }}
      >
        <View
          style={{
            backgroundColor: CREAM,
            borderRadius: 4,
            padding: 24,
            borderWidth: 1,
            borderColor: "rgba(45,36,26,0.18)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner decorations */}
          {(
            [
              { top: 8, left: 8 },
              { top: 8, right: 8 },
              { bottom: 8, left: 8 },
              { bottom: 8, right: 8 },
            ] as const
          ).map((pos, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                width: 22,
                height: 22,
                borderTopWidth: "top" in pos ? 1 : 0,
                borderBottomWidth: "bottom" in pos ? 1 : 0,
                borderLeftWidth: "left" in pos ? 1 : 0,
                borderRightWidth: "right" in pos ? 1 : 0,
                borderColor: "rgba(45,36,26,0.25)",
                ...pos,
              }}
            />
          ))}

          <Text
            style={{
              fontSize: 8,
              fontWeight: "700",
              letterSpacing: 3.5,
              color: "rgba(45,36,26,0.45)",
              textAlign: "center",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            HEARTLOOM
          </Text>
          <Text
            style={{
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 15,
              color: "rgba(45,36,26,0.8)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Certificate of Legacy
          </Text>

          <View
            style={{
              height: 0.5,
              backgroundColor: "rgba(45,36,26,0.15)",
              marginBottom: 16,
            }}
          />

          <Text
            style={{
              fontSize: 11.5,
              color: "rgba(45,36,26,0.5)",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            This is to certify that
          </Text>
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 20,
              fontWeight: "600",
              color: TEXT,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {sig}
          </Text>
          <Text
            style={{
              fontSize: 11.5,
              color: "rgba(45,36,26,0.5)",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            sealed a Future Letter for
          </Text>
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 19,
              fontWeight: "600",
              color: AMBER_DEEP,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              fontSize: 11.5,
              color: "rgba(45,36,26,0.5)",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            on {sealDate}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              paddingHorizontal: 8,
            }}
          >
            <SmallWaxSeal size={64} />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(45,36,26,0.2)",
                  marginBottom: 4,
                }}
              />
              <Text style={{ fontSize: 10, color: MUTED }}>
                Custodian, Heartloom Archive
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 9.5,
              color: "rgba(45,36,26,0.4)",
              textAlign: "center",
              letterSpacing: 0.3,
              fontVariant: ["tabular-nums"],
            }}
          >
            № {certNo}
          </Text>
        </View>
      </Animated.View>

      <View style={{ gap: 10, marginBottom: 28 }}>
        {[
          "A printable PDF lands in your inbox in under 60 seconds.",
          "Share it, frame it, file it with your estate papers.",
          "Cryptographically vaulted. Legally admissible.",
        ].map((b) => (
          <View key={b} style={{ flexDirection: "row", gap: 10 }}>
            <Text style={{ fontSize: 11, color: AMBER, marginTop: 1 }}>✦</Text>
            <Text style={{ fontSize: 13.5, color: INK_SOFT, flex: 1, lineHeight: 20 }}>
              {b}
            </Text>
          </View>
        ))}
      </View>

      <PrimaryBtn
        label={isAuthenticated ? "See where it lives" : "Save my letter and create account"}
        onPress={onDone}
      />

      {!isAuthenticated && (
        <Pressable
          onPress={() => router.replace("/(auth)/sign-in")}
          style={({ pressed }) => ({
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: RULE,
            marginTop: 10,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14, color: INK_SOFT }}>
            I already have an account
          </Text>
        </Pressable>
      )}

      <Text
        style={{
          fontSize: 11,
          color: MUTED,
          textAlign: "center",
          marginTop: 16,
          lineHeight: 17,
        }}
      >
        {isAuthenticated
          ? "Check your email for the PDF certificate."
          : "Free to start. No credit card needed."}
      </Text>
    </View>
  );
}
