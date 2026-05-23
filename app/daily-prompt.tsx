import { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const PAPER = "#FBF4DC";
const RULE = "rgba(74,47,24,0.14)";
const SAGE_DEEP = "#6F8564";

const PROMPT_LOG = [
  {
    day: "TUE",
    done: true,
    prompt: '"The first time you knew you were home."',
    meta: "Sealed · 1:42 voice · added to Story Archive",
  },
  {
    day: "MON",
    done: true,
    prompt: '"Advice you\'d give your 22-year-old self."',
    meta: "Sealed · 84 words · for Maya",
  },
  {
    day: "SUN",
    done: false,
    prompt: '"A recipe that means something."',
    meta: "Skipped · we'll bring it back",
  },
];

export default function DailyPromptScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: CREAM,
            borderBottomWidth: 1,
            borderBottomColor: RULE,
            // grid: 36px | 1fr | auto
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: RULE,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
              flexShrink: 0,
            })}
          >
            <Text style={{ fontSize: 20, color: INK_SOFT, lineHeight: 24, marginTop: -1 }}>‹</Text>
          </Pressable>

          {/* Title */}
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 14,
              color: INK_SOFT,
            }}
          >
            Today's prompt
          </Text>

          {/* Step badge */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              color: INK_MUTED,
              minWidth: 48,
              textAlign: "right",
            }}
          >
            Daily
          </Text>
        </View>

        <Animated.View
          style={{ flex: 1, opacity, transform: [{ translateY: slideY }] }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 22, paddingBottom: 40 }}
          >
            {/* ── Eyebrow ── */}
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 2,
                color: INK_MUTED,
                marginBottom: 8,
              }}
            >
              LEGACY ONBOARDING · WEDNESDAY
            </Text>

            {/* ── Display heading ── */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontWeight: "500",
                fontSize: 26,
                lineHeight: 32,
                letterSpacing: -0.3,
                color: INK,
                marginBottom: 22,
              }}
            >
              One small thing,{"\n"}
              <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>
                before the day pulls you away.
              </Text>
            </Text>

            {/* ── Prompt card ── */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                marginBottom: 28,
                borderLeftWidth: 3,
                borderLeftColor: AMBER,
                shadowColor: INK,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
                overflow: "hidden",
              }}
            >
              <View style={{ padding: 16, gap: 10 }}>
                {/* Card line */}
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "700",
                    letterSpacing: 1.8,
                    color: AMBER_DEEP,
                  }}
                >
                  PROMPT OF THE DAY
                </Text>

                {/* Prompt question */}
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontStyle: "italic",
                    fontSize: 17,
                    color: INK,
                    lineHeight: 26,
                  }}
                >
                  "What's a sound from your childhood that nobody makes anymore?"
                </Text>

                {/* Meta row */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 12, color: INK_MUTED }}>60 seconds</Text>
                  <Text style={{ fontSize: 12, color: INK_MUTED }}>·</Text>
                  <Text style={{ fontSize: 12, color: INK_MUTED }}>Voice or text</Text>
                  <Text style={{ fontSize: 12, color: INK_MUTED }}>·</Text>
                  <Text style={{ fontSize: 12, color: INK_MUTED }}>
                    For <Text style={{ fontStyle: "italic" }}>Maya</Text>
                  </Text>
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
                  <Pressable
                    onPress={() => router.push("/record" as any)}
                    style={({ pressed }) => ({
                      backgroundColor: INK,
                      borderRadius: 26,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: CREAM,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      Begin in 60 sec
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => ({
                      borderRadius: 26,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: RULE,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: INK,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      Type it instead
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* ── This week ── */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontWeight: "500",
                fontSize: 16,
                color: INK,
                marginBottom: 12,
              }}
            >
              This week
            </Text>

            <View style={{ gap: 0 }}>
              {PROMPT_LOG.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingVertical: 14,
                    borderBottomWidth: index < PROMPT_LOG.length - 1 ? 1 : 0,
                    borderBottomColor: RULE,
                  }}
                >
                  {/* Day label */}
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 1,
                      color: item.done ? AMBER_DEEP : INK_MUTED,
                      width: 32,
                      marginTop: 2,
                    }}
                  >
                    {item.day}
                  </Text>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Georgia",
                        fontSize: 14,
                        color: item.done ? INK_SOFT : INK_MUTED,
                        lineHeight: 20,
                        marginBottom: 3,
                      }}
                    >
                      {item.prompt}
                    </Text>
                    <Text style={{ fontSize: 11.5, color: INK_MUTED }}>
                      {item.meta}
                    </Text>
                  </View>

                  {/* Status indicator */}
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: item.done ? 15 : 14,
                        color: item.done ? SAGE_DEEP : INK_MUTED,
                        lineHeight: 20,
                      }}
                    >
                      {item.done ? "✓" : "○"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Footer ── */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontStyle: "italic",
                fontSize: 14,
                color: INK_MUTED,
                marginTop: 20,
                lineHeight: 22,
              }}
            >
              3 in a row. You're building a heirloom one Wednesday at a time.
            </Text>

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
