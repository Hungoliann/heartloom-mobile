import { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";

const ALL_STORIES = [
  { id: "1", title: "The porch in Alabama", person: "Grandma Ruth", duration: "3:42", bars: [8, 14, 18, 11, 15, 8, 12, 16, 9, 13], date: "Mar 12, 2024", tag: "For Maya" },
  { id: "2", title: "Our first Sunday dinner", person: "Dad", duration: "2:18", bars: [12, 7, 16, 20, 9, 14, 6, 18, 11, 8], date: "Feb 2, 2024", tag: "For Theo" },
  { id: "3", title: "What I want you to know", person: "Eleanor", duration: "7:12", bars: [6, 18, 10, 15, 22, 8, 13, 17, 7, 20], date: "Jan 15, 2024", tag: "For Maya" },
  { id: "4", title: "The cabin in Tahoe", person: "Grandma Ruth", duration: "4:55", bars: [9, 15, 11, 18, 13, 7, 16, 10, 20, 12], date: "Dec 24, 2023", tag: "For All" },
  { id: "5", title: "How I met your grandfather", person: "Nana", duration: "6:30", bars: [14, 8, 20, 12, 16, 9, 13, 18, 7, 15], date: "Nov 3, 2023", tag: "For Family" },
  { id: "6", title: "The year everything changed", person: "Mom", duration: "5:15", bars: [10, 17, 13, 7, 19, 11, 15, 8, 22, 14], date: "Oct 8, 2023", tag: "For Maya" },
];

export default function StoriesScreen() {
  const router = useRouter();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(45,36,26,0.07)" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="chevron-left" size={22} color={INK_SOFT} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontFamily: "Georgia", fontWeight: "600", color: INK }}>Saved Stories</Text>
            <Text style={{ fontSize: 10, color: INK_MUTED, marginTop: 1 }}>{ALL_STORIES.length} recordings</Text>
          </View>
          <Pressable
            onPress={() => router.push("/record")}
            style={({ pressed }) => ({
              backgroundColor: AMBER,
              borderRadius: 999,
              paddingVertical: 8,
              paddingHorizontal: 14,
              opacity: pressed ? 0.85 : 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            })}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" }} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#FFFFFF" }}>Record</Text>
          </Pressable>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
        >
          {ALL_STORIES.map((story) => {
            const isPlaying = playingId === story.id;
            const playhead = Math.floor(story.bars.length * 0.45);
            return (
              <Pressable
                key={story.id}
                style={({ pressed }) => ({
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: isPlaying ? 1.5 : 1,
                  borderColor: isPlaying ? AMBER : "rgba(45,36,26,0.07)",
                  shadowColor: INK,
                  shadowOffset: { width: 0, height: isPlaying ? 6 : 2 },
                  shadowOpacity: isPlaying ? 0.12 : 0.06,
                  shadowRadius: isPlaying ? 14 : 6,
                  elevation: isPlaying ? 4 : 2,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  {/* Play/Pause button */}
                  <Pressable
                    onPress={() => setPlayingId(isPlaying ? null : story.id)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isPlaying ? AMBER : "rgba(210,127,20,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: AMBER,
                      shadowOffset: { width: 0, height: isPlaying ? 4 : 0 },
                      shadowOpacity: isPlaying ? 0.4 : 0,
                      shadowRadius: 8,
                      elevation: isPlaying ? 3 : 0,
                    }}
                  >
                    <Feather
                      name={isPlaying ? "pause" : "play"}
                      size={16}
                      color={isPlaying ? "#FFFFFF" : AMBER}
                      style={{ marginLeft: isPlaying ? 0 : 2 }}
                    />
                  </Pressable>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13.5, fontFamily: "Georgia", fontWeight: "600", color: INK, marginBottom: 2 }}>
                      {story.title}
                    </Text>
                    <Text style={{ fontSize: 10.5, color: INK_MUTED }}>{story.person} · {story.duration}</Text>
                  </View>

                  <View style={{ backgroundColor: "rgba(210,127,20,0.1)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: "600", color: AMBER_DEEP }}>{story.tag}</Text>
                  </View>
                </View>

                {/* Waveform */}
                <View style={{ flexDirection: "row", gap: 2, alignItems: "center", marginTop: 12, paddingLeft: 56 }}>
                  {story.bars.map((h, i) => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        height: h,
                        borderRadius: 2,
                        backgroundColor: isPlaying && i < playhead ? AMBER : "#8B6039",
                        opacity: isPlaying && i < playhead ? 0.9 : 0.28,
                      }}
                    />
                  ))}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingLeft: 56 }}>
                  <Text style={{ fontSize: 9.5, color: INK_MUTED }}>{story.date}</Text>
                  <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                    <Feather name="more-horizontal" size={16} color={INK_MUTED} />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
