import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

const AMBER = "#D27F14";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const SCREEN_BG = "#EAD9C0";

const MEMORY_DATA: Record<string, { year: string; title: string; description: string; icon: string; color: string; person: string; stories: number }> = {
  "1": { year: "1998", title: "Wedding Day", description: "The chapel on the lake at Tahoe. It rained the night before and the morning was impossibly clear. Every family member within a hundred miles was there.", icon: "♡", color: "#6F8564", person: "Eleanor & Robert", stories: 4 },
  "2": { year: "2006", title: "First Letter", description: "The first letter ever sealed in the family — written in one sitting on a Thursday night. It was for Maya, though Maya wasn't born yet.", icon: "✉", color: "#4A2F18", person: "Eleanor", stories: 1 },
  "3": { year: "2012", title: "A Summer", description: "The long summer where everyone gathered at the cabin. No phones, no plans. Just the lake and whoever showed up.", icon: "☀", color: "#5C3A1E", person: "The Family", stories: 7 },
  "4": { year: "2019", title: "Graduation", description: "Maya graduated top of her class. The speech she gave made the whole auditorium go quiet.", icon: "✦", color: "#FAF3E2", person: "Maya", stories: 3 },
  "5": { year: "2034", title: "Maya's Day", description: "A letter sealed and waiting. It will open the moment the day arrives. She doesn't know it exists yet.", icon: "★", color: AMBER, person: "For Maya", stories: 0 },
};

export default function MemoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const memory = MEMORY_DATA[id ?? "1"] ?? MEMORY_DATA["1"];

  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const circleScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.spring(circleScale, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="x" size={20} color={INK_SOFT} />
          </Pressable>
          <Text style={{ flex: 1, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: "700", color: INK_MUTED }}>
            Memory
          </Text>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ padding: 24, alignItems: "center", paddingBottom: 48 }}
        >
          {/* Circle icon */}
          <Animated.View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: memory.color,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              transform: [{ scale: circleScale }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: memory.color === "#FAF3E2" ? 1.5 : 0,
              borderColor: "rgba(45,36,26,0.1)",
            }}
          >
            <Text style={{ fontSize: 36 }}>{memory.icon}</Text>
          </Animated.View>

          <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: INK_MUTED, fontWeight: "700", marginBottom: 6 }}>
            {memory.year}
          </Text>
          <Text style={{ fontFamily: "Georgia", fontSize: 26, fontWeight: "600", color: INK, textAlign: "center", marginBottom: 8 }}>
            {memory.title}
          </Text>
          <Text style={{ fontSize: 12, color: INK_MUTED, marginBottom: 24 }}>
            {memory.person}
          </Text>

          {/* Description */}
          <View style={{ backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 16, padding: 20, width: "100%", marginBottom: 20, borderWidth: 1, borderColor: "rgba(45,36,26,0.07)" }}>
            <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 15, lineHeight: 23, color: INK_SOFT, textAlign: "center" }}>
              "{memory.description}"
            </Text>
          </View>

          {/* Stories count */}
          {memory.stories > 0 && (
            <Pressable
              onPress={() => router.push("/stories")}
              style={({ pressed }) => ({
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                opacity: pressed ? 0.88 : 1,
                shadowColor: INK,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              })}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#FFFFFF", fontSize: 10, marginLeft: 2 }}>▶</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontFamily: "Georgia", fontWeight: "600", color: INK }}>
                  {memory.stories} saved {memory.stories === 1 ? "story" : "stories"}
                </Text>
                <Text style={{ fontSize: 10.5, color: INK_MUTED, marginTop: 1 }}>Tap to listen</Text>
              </View>
              <Feather name="chevron-right" size={16} color={INK_MUTED} />
            </Pressable>
          )}

          {/* Add to this memory */}
          <Pressable
            onPress={() => router.push("/record")}
            style={({ pressed }) => ({
              width: "100%",
              backgroundColor: AMBER,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
              opacity: pressed ? 0.88 : 1,
              shadowColor: AMBER,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 14,
              elevation: 5,
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            })}
          >
            <Text style={{ fontSize: 14.5, fontWeight: "600", color: "#FFFFFF" }}>Add to this memory</Text>
            <Feather name="mic" size={15} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
