import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/auth.store";

const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";

const SAVED_STORIES = [
  { id: "1", title: "The porch in Alabama", person: "Grandma Ruth", duration: "3:42", bars: [8, 14, 18, 11, 15, 8, 12] },
  { id: "2", title: "Our first Sunday dinner", person: "Dad", duration: "2:18", bars: [12, 7, 16, 20, 9, 14, 6] },
  { id: "3", title: "What I want you to know", person: "For Maya", duration: "7:12", bars: [6, 18, 10, 15, 22, 8, 13] },
];

const PROMPTS = [
  { id: "1", text: "If you could only leave one piece of advice for Maya…", icon: "✦" },
  { id: "2", text: "Tell me about the first home you ever loved.", icon: "♡" },
  { id: "3", text: "What is one thing you want them to know forever?", icon: "✎" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  const firstName = user?.name?.split(" ")[0] ?? "Eleanor";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    const runPulse = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.38, duration: 950, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 950, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ]).start(() => runPulse());
    };
    const t = setTimeout(runPulse, 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: AMBER }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── Amber hero ── */}
        <SafeAreaView edges={["top"]}>
          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 9, letterSpacing: 2, color: "rgba(45,36,26,0.52)", textTransform: "uppercase", fontWeight: "600" }}>
                  {getGreeting()}
                </Text>
                <Text style={{ fontSize: 18, fontFamily: "Georgia", fontWeight: "600", color: INK, marginTop: 1 }}>
                  {firstName}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(45,36,26,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Feather name="bell" size={15} color={INK_SOFT} />
              </Pressable>
            </View>

            {/* Hero letter preview card */}
            <Pressable
              onPress={() => router.push("/letter")}
              style={({ pressed }) => ({
                marginHorizontal: 20,
                marginTop: 14,
                borderRadius: 18,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
                elevation: 10,
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <View style={{ backgroundColor: "#5C3510", padding: 22 }}>
                {/* Warm texture overlay */}
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#7B4C22", opacity: 0.38 }} />

                {/* Wax seal */}
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: "#8A3A0E",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#5E240A",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.65,
                    shadowRadius: 7,
                    elevation: 4,
                  }}
                >
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontWeight: "700", fontSize: 21, color: "#F3C896" }}>H</Text>
                </View>

                <Text style={{ fontSize: 8.5, letterSpacing: 2.2, textTransform: "uppercase", color: "rgba(250,243,226,0.48)", marginBottom: 13, fontWeight: "700" }}>
                  YOUR NEXT LETTER
                </Text>
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontStyle: "italic",
                    fontSize: 18,
                    color: "rgba(250,243,226,0.95)",
                    lineHeight: 26,
                    marginBottom: 8,
                    paddingRight: 56,
                  }}
                >
                  "To my daughter, Maya — on her wedding day…"
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#F3C896", opacity: 0.7 }} />
                  <Text style={{ fontSize: 10, color: "rgba(250,243,226,0.48)", fontFamily: "Georgia", fontStyle: "italic" }}>
                    Sealed · opens June 14, 2034
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </SafeAreaView>

        {/* Wave amber → cream */}
        <View style={{ height: 40, backgroundColor: CREAM, borderTopLeftRadius: 600, borderTopRightRadius: 600, marginTop: 20 }} />

        {/* ── Cream body ── */}
        <Animated.View style={{ backgroundColor: CREAM, opacity, transform: [{ translateY: slideY }] }}>
          {/* Heading + CTA */}
          <View style={{ paddingHorizontal: 24, alignItems: "center", paddingBottom: 28, paddingTop: 2 }}>
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 21,
                fontWeight: "500",
                color: INK,
                lineHeight: 29,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Write your first{"\n"}Future Letter.
            </Text>
            <Text style={{ fontSize: 12.5, lineHeight: 19, color: INK_SOFT, textAlign: "center", marginBottom: 24, maxWidth: 248 }}>
              A sentence is enough. We'll thread it into something that lasts.
            </Text>

            {/* Pulsing CTA */}
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Animated.View
                style={{
                  position: "absolute",
                  width: 164,
                  height: 48,
                  borderRadius: 999,
                  backgroundColor: AMBER,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                }}
              />
              <Pressable
                onPress={() => router.push("/record")}
                style={({ pressed }) => ({
                  backgroundColor: AMBER,
                  borderRadius: 999,
                  paddingVertical: 14,
                  paddingHorizontal: 34,
                  opacity: pressed ? 0.88 : 1,
                  shadowColor: AMBER,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.55,
                  shadowRadius: 16,
                  elevation: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                })}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600", letterSpacing: 0.3 }}>Future Letter</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>✎</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/record")}
              style={({ pressed }) => ({
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: INK_SOFT, alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: CREAM }} />
              </View>
              <Text style={{ fontSize: 12.5, color: INK_SOFT, fontWeight: "500" }}>Record 60 seconds instead</Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.07)", marginHorizontal: 20, marginBottom: 22 }} />

          {/* Saved stories */}
          <View style={{ paddingHorizontal: 20, marginBottom: 26 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 15, fontFamily: "Georgia", fontWeight: "500", color: INK }}>Saved stories</Text>
                <Text style={{ fontSize: 9.5, color: INK_MUTED, marginTop: 2 }}>3 recordings · 13:12 total</Text>
              </View>
              <Pressable onPress={() => router.push("/stories")} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ fontSize: 11, color: AMBER_DEEP, fontWeight: "600" }}>See all →</Text>
              </Pressable>
            </View>
            <View style={{ gap: 9 }}>
              {SAVED_STORIES.map((story) => (
                <Pressable
                  key={story.id}
                  onPress={() => router.push("/stories")}
                  style={({ pressed }) => ({
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 13,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    opacity: pressed ? 0.88 : 1,
                    shadowColor: INK,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.07,
                    shadowRadius: 8,
                    elevation: 2,
                  })}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: AMBER,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: AMBER,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.4,
                      shadowRadius: 5,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 11, marginLeft: 2 }}>▶</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Georgia", fontWeight: "600", color: INK, marginBottom: 2 }}>{story.title}</Text>
                    <Text style={{ fontSize: 10.5, color: INK_MUTED }}>{story.person} · {story.duration}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 2.5, alignItems: "center" }}>
                    {story.bars.map((h, i) => (
                      <View key={i} style={{ width: 2.5, height: h, borderRadius: 1.5, backgroundColor: "#8B6039", opacity: 0.45 + i * 0.05 }} />
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.07)", marginHorizontal: 20, marginBottom: 22 }} />

          {/* Prompts */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 36 }}>
            <Text style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: INK_MUTED, fontWeight: "700", marginBottom: 13 }}>
              Start with a prompt
            </Text>
            <View style={{ gap: 9 }}>
              {PROMPTS.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push({ pathname: "/record", params: { promptId: p.id } })}
                  style={({ pressed }) => ({
                    backgroundColor: "#FFFFFF",
                    borderRadius: 13,
                    padding: 14,
                    borderLeftWidth: 3,
                    borderLeftColor: AMBER,
                    opacity: pressed ? 0.82 : 1,
                    shadowColor: INK,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                    elevation: 1,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  })}
                >
                  <Text style={{ fontSize: 14, color: AMBER, marginTop: 1 }}>{p.icon}</Text>
                  <Text style={{ flex: 1, fontSize: 12.5, fontFamily: "Georgia", fontStyle: "italic", color: INK, lineHeight: 19 }}>
                    "{p.text}"
                  </Text>
                  <Feather name="chevron-right" size={14} color={INK_MUTED} style={{ marginTop: 2 }} />
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
