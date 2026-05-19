import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/auth.store";

const { width: W } = Dimensions.get("window");

const CREAM = "#FAF3E2";
const PARCHMENT = "#FBF2DD";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";

type Slide = {
  key: string;
  icon: string;
  iconBg: string;
  title: string;
  titleHighlight?: string;
  sub: string;
  tag?: string;
};

const SLIDES: Slide[] = [
  {
    key: "welcome",
    icon: "♡",
    iconBg: "transparent",
    title: "Hi. I'm here\nto help you record ",
    titleHighlight: "something that lasts.",
    sub: "In about ten minutes you'll have an heirloom — sealed, certified, and waiting for the day that matters.",
  },
  {
    key: "letters",
    icon: "✉",
    iconBg: "#4A2F18",
    title: "Write letters\nto the future.",
    sub: "Seal a message for Maya's wedding day, Theo's graduation, or just a quiet Tuesday in 2035. We'll deliver it exactly when you choose.",
    tag: "Future Letters",
  },
  {
    key: "voice",
    icon: "◉",
    iconBg: AMBER,
    title: "Your voice,\nthreaded in time.",
    sub: "A 60-second story from you is worth a thousand photos. Record once — your family hears it forever, exactly the way you said it.",
    tag: "Voice Memories",
  },
  {
    key: "family",
    icon: "✦",
    iconBg: "#6F8564",
    title: "One family.\nOne living story.",
    sub: "Every letter, memory, and milestone — woven together so nothing important gets lost between generations.",
    tag: "Family Timeline",
  },
];

function DottedCircle({ size, dotRadius }: { size: number; dotRadius: number }) {
  const count = 24;
  const r = size / 2 - dotRadius;
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const x = size / 2 + r * Math.cos(angle) - dotRadius;
        const y = size / 2 + r * Math.sin(angle) - dotRadius;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: dotRadius * 2,
              height: dotRadius * 2,
              borderRadius: dotRadius,
              backgroundColor: "rgba(210,127,20,0.35)",
            }}
          />
        );
      })}
    </View>
  );
}

function SlideView({ slide }: { slide: Slide }) {
  const isFirst = slide.key === "welcome";

  return (
    <View style={{ width: W, alignItems: "center", paddingHorizontal: 32, paddingTop: 20 }}>
      {/* Icon area */}
      <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 36, height: 130 }}>
        {isFirst ? (
          <View style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}>
            <DottedCircle size={120} dotRadius={3} />
            <View style={{ position: "absolute" }}>
              <Text style={{ fontSize: 44, color: AMBER, lineHeight: 50 }}>♡</Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: slide.iconBg,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: slide.iconBg,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 32, color: "#FFFFFF", lineHeight: 38 }}>{slide.icon}</Text>
          </View>
        )}
        {slide.tag && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: "rgba(210,127,20,0.12)",
              borderRadius: 99,
              paddingHorizontal: 11,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: "rgba(210,127,20,0.25)",
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 1.4, color: AMBER_DEEP, textTransform: "uppercase" }}>
              {slide.tag}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: isFirst ? 28 : 26,
          fontWeight: "500",
          color: INK,
          textAlign: "center",
          lineHeight: isFirst ? 36 : 34,
          marginBottom: 14,
        }}
      >
        {slide.title}
        {slide.titleHighlight && (
          <Text style={{ fontStyle: "italic", color: AMBER }}>{slide.titleHighlight}</Text>
        )}
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 14,
          lineHeight: 22,
          color: INK_SOFT,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        {slide.sub}
      </Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasOnboarded = useAuthStore((s) => s.setHasOnboarded);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setActiveIdx(idx);
  }, []);

  function handleNext() {
    scrollRef.current?.scrollTo({ x: (activeIdx + 1) * W, animated: true });
  }

  function handleDraftLetter() {
    setHasOnboarded();
    router.replace({ pathname: "/(auth)/sign-in", params: { next: "/record" } });
  }

  function handleExplore() {
    setHasOnboarded();
    router.replace("/(auth)/sign-in");
  }

  const isLast = activeIdx === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* HEARTLOOM wordmark */}
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 3.5, color: INK_MUTED, textTransform: "uppercase" }}>
            HEARTLOOM
          </Text>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {SLIDES.map((slide) => (
            <SlideView key={slide.key} slide={slide} />
          ))}
        </ScrollView>

        {/* Bottom section */}
        <View style={{ paddingHorizontal: 28, paddingBottom: 12 }}>
          {/* Dot indicators */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 7, marginBottom: 24 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeIdx ? 20 : 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: i === activeIdx ? AMBER : "rgba(210,127,20,0.25)",
                }}
              />
            ))}
          </View>

          {isLast ? (
            <>
              {/* Draft CTA — primary */}
              <Pressable
                onPress={handleDraftLetter}
                style={({ pressed }) => ({
                  backgroundColor: INK,
                  borderRadius: 14,
                  paddingVertical: 17,
                  alignItems: "center",
                  opacity: pressed ? 0.88 : 1,
                  shadowColor: INK,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  elevation: 6,
                  marginBottom: 10,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: CREAM, letterSpacing: 0.2 }}>
                  Draft a Future Letter ✎
                </Text>
              </Pressable>

              {/* Explore — secondary */}
              <Pressable
                onPress={handleExplore}
                style={({ pressed }) => ({
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                  borderWidth: 1,
                  borderColor: "rgba(45,36,26,0.15)",
                  marginBottom: 14,
                })}
              >
                <Text style={{ fontSize: 14, color: INK_SOFT }}>Explore the app first</Text>
              </Pressable>

              <Text style={{ fontSize: 11.5, color: INK_MUTED, textAlign: "center", lineHeight: 18 }}>
                No account yet. No commitment.{"\n"}We'll do that last.
              </Text>
            </>
          ) : (
            <>
              {/* Next button */}
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => ({
                  backgroundColor: INK,
                  borderRadius: 14,
                  paddingVertical: 17,
                  alignItems: "center",
                  opacity: pressed ? 0.88 : 1,
                  shadowColor: INK,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  elevation: 6,
                  marginBottom: 14,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: CREAM, letterSpacing: 0.2 }}>Next</Text>
              </Pressable>

              <Pressable onPress={handleDraftLetter} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignItems: "center" })}>
                <Text style={{ fontSize: 12, color: INK_MUTED }}>Skip</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
