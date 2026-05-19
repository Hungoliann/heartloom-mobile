import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const SCREEN_W = Dimensions.get("window").width;
const AMBER = "#D27F14";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const SCREEN_BG = "#EAD9C0";
const HEADER_BG = "#7A4820";

const BUBBLE_SIZE = 92;
const DOT_SIZE = 11;

type BubbleType = "sage" | "navy" | "photo" | "cream" | "amber";

type Memory = {
  id: string;
  year: string;
  label?: string;
  sub?: string;
  icon?: string;
  side: "left" | "right";
  type: BubbleType;
  photo?: boolean;
};

const MEMORIES: Memory[] = [
  { id: "1", year: "1998", label: "Wedding Day", sub: "The Tahoe chapel", icon: "♡", side: "left", type: "sage" },
  { id: "2", year: "2006", label: "First Letter", sub: "Written & sealed", icon: "✉", side: "right", type: "navy" },
  { id: "3", year: "2012", side: "left", type: "photo", photo: true },
  { id: "4", year: "2019", label: "Graduation", sub: "Maya's big day", icon: "✦", side: "right", type: "cream" },
  { id: "5", year: "2034", label: "Maya's Day", sub: "Sealed · waiting", icon: "★", side: "left", type: "amber" },
];

const BUBBLE_COLORS: Record<BubbleType, { bg: string; text: string }> = {
  sage: { bg: "#6F8564", text: "#FFFFFF" },
  navy: { bg: "#4A2F18", text: "#FFFFFF" },
  photo: { bg: "#5C3A1E", text: "#FFFFFF" },
  cream: { bg: CREAM, text: INK_SOFT },
  amber: { bg: AMBER, text: "#FFFFFF" },
};

function MemoryBubble({ memory }: { memory: Memory }) {
  const colors = BUBBLE_COLORS[memory.type];
  return (
    <View
      style={{
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: BUBBLE_SIZE / 2,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: memory.type === "cream" ? 1.5 : 0,
        borderColor: "rgba(45,36,26,0.1)",
      }}
    >
      {memory.photo ? (
        <>
          <Feather name="image" size={24} color="rgba(250,243,226,0.5)" />
          <Text style={{ color: "rgba(250,243,226,0.55)", fontSize: 8.5, marginTop: 4, letterSpacing: 0.8, fontWeight: "600" }}>PHOTO</Text>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 16, color: colors.text, opacity: 0.9, marginBottom: 3 }}>{memory.icon}</Text>
          <Text style={{ fontFamily: "Georgia", fontSize: 10, fontWeight: "700", color: colors.text, textAlign: "center", lineHeight: 14 }}>
            {memory.label}
          </Text>
          <Text style={{ fontSize: 7.5, letterSpacing: 0.5, color: colors.text, opacity: 0.72, marginTop: 2, textAlign: "center" }}>
            {memory.sub}
          </Text>
        </>
      )}
    </View>
  );
}

export default function TimelineScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Rich dark header */}
        <View style={{ backgroundColor: HEADER_BG, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Feather name="menu" size={18} color="rgba(250,243,226,0.75)" />
            <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 3.2, color: "rgba(250,243,226,0.85)", textTransform: "uppercase" }}>
              HEARTLOOM
            </Text>
            <Feather name="bell" size={17} color="rgba(250,243,226,0.75)" />
          </View>
          <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 21, color: CREAM, fontWeight: "500", lineHeight: 27 }}>
            Your family's{"\n"}living story.
          </Text>
          <Text style={{ fontSize: 11, color: "rgba(250,243,226,0.6)", marginTop: 5, lineHeight: 16 }}>
            Every letter, memory, and milestone — threaded in time.
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
            {/* Stats row */}
            <View style={{ paddingHorizontal: 18, paddingTop: 18, flexDirection: "row", gap: 10, marginBottom: 6 }}>
              {[
                { num: "33", label: "Family Stories" },
                { num: "13", label: "Milestones" },
              ].map((stat) => (
                <View
                  key={stat.num}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.55)",
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(45,36,26,0.07)",
                    shadowColor: INK,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 5,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontFamily: "Georgia", fontSize: 26, fontWeight: "600", color: AMBER, lineHeight: 28 }}>{stat.num}</Text>
                  <Text style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3, textAlign: "center", fontWeight: "500" }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Timeline */}
            <View style={{ paddingHorizontal: 14, paddingTop: 24, position: "relative", minHeight: MEMORIES.length * 118 + 80 }}>
              {/* Spine line */}
              <View
                style={{
                  position: "absolute",
                  top: 24,
                  bottom: 60,
                  left: SCREEN_W / 2 - 1,
                  width: 2,
                  backgroundColor: "rgba(74,47,24,0.25)",
                }}
              />

              {/* Memory rows */}
              <View style={{ gap: 16 }}>
                {MEMORIES.map((memory) => {
                  const isLeft = memory.side === "left";
                  return (
                    <View
                      key={memory.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: isLeft ? "flex-start" : "flex-end",
                        minHeight: BUBBLE_SIZE + 12,
                        gap: 10,
                        paddingHorizontal: 8,
                      }}
                    >
                      {isLeft ? (
                        <>
                          <Pressable
                            onPress={() => router.push({ pathname: "/memory", params: { id: memory.id } })}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.85 : 1,
                              transform: [{ scale: pressed ? 0.95 : 1 }],
                            })}
                          >
                            <MemoryBubble memory={memory} />
                          </Pressable>
                          {/* Connector dot */}
                          <View
                            style={{
                              width: DOT_SIZE,
                              height: DOT_SIZE,
                              borderRadius: DOT_SIZE / 2,
                              backgroundColor: "#7A4820",
                              borderWidth: 2.5,
                              borderColor: SCREEN_BG,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.2,
                              shadowRadius: 3,
                              elevation: 2,
                            }}
                          />
                          <Text style={{ fontSize: 11, fontWeight: "700", color: INK_SOFT, minWidth: 52, letterSpacing: 0.3 }}>
                            {memory.year}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={{ fontSize: 11, fontWeight: "700", color: INK_SOFT, minWidth: 52, textAlign: "right", letterSpacing: 0.3 }}>
                            {memory.year}
                          </Text>
                          <View
                            style={{
                              width: DOT_SIZE,
                              height: DOT_SIZE,
                              borderRadius: DOT_SIZE / 2,
                              backgroundColor: "#7A4820",
                              borderWidth: 2.5,
                              borderColor: SCREEN_BG,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.2,
                              shadowRadius: 3,
                              elevation: 2,
                            }}
                          />
                          <Pressable
                            onPress={() => router.push({ pathname: "/memory", params: { id: memory.id } })}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.85 : 1,
                              transform: [{ scale: pressed ? 0.95 : 1 }],
                            })}
                          >
                            <MemoryBubble memory={memory} />
                          </Pressable>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Add memory button */}
              <View style={{ alignItems: "center", marginTop: 24 }}>
                <Pressable
                  onPress={() => router.push("/record")}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#4A2F18",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.85 : 1,
                    shadowColor: "#4A2F18",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.45,
                    shadowRadius: 10,
                    elevation: 6,
                  })}
                >
                  <Text style={{ color: "#FAF3E2", fontSize: 26, fontWeight: "300", lineHeight: 30 }}>+</Text>
                </Pressable>
                <Text style={{ marginTop: 7, fontSize: 10, color: INK_MUTED, letterSpacing: 0.6, fontWeight: "500" }}>Add a memory</Text>
              </View>
            </View>

            {/* "Your legacy by the numbers" card */}
            <View
              style={{
                marginHorizontal: 18,
                marginTop: 8,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 3,
                borderLeftColor: AMBER,
                shadowColor: INK,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 9.5, letterSpacing: 1.6, textTransform: "uppercase", color: AMBER, fontWeight: "700", marginBottom: 6 }}>
                NEXT UP
              </Text>
              <Text style={{ fontFamily: "Georgia", fontSize: 14, color: INK, fontWeight: "500", lineHeight: 20, marginBottom: 4 }}>
                Maya's 18th Birthday — June 14
              </Text>
              <Text style={{ fontSize: 11, color: INK_MUTED, lineHeight: 16 }}>
                A sealed letter is ready to send. Review it before the day.
              </Text>
              <Pressable
                onPress={() => router.push("/letter")}
                style={({ pressed }) => ({ marginTop: 10, alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ fontSize: 11.5, color: AMBER, fontWeight: "600" }}>Review letter →</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
