import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const BUTTER = "#F5DEAA";

const UPCOMING = [
  { id: "1", day: "14", month: "JUN", title: "Maya's 18th Birthday", sub: "Sealed letter ready to send", dot: AMBER },
  { id: "2", day: "25", month: "DEC", title: "Christmas — whole family", sub: "4 min voice note, not yet sealed", dot: "#9CAF88" },
  { id: "3", day: "03", month: "AUG", title: "Dad's retirement", sub: "Milestone trigger · draft started", dot: AMBER },
];

const AUDIO_STORIES = [
  { id: "1", title: "The porch in Alabama", person: "Grandma Ruth", duration: "3:42" },
  { id: "2", title: "Our first Sunday dinner", person: "Dad", duration: "2:18" },
];

const CHART_BARS = [60, 72, 55, 80];

export default function ConciergeScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: AMBER }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Amber hero section */}
        <SafeAreaView edges={["top"]}>
          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
            {/* App header */}
            <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Feather name="menu" size={18} color="rgba(45,36,26,0.55)" />
              <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 3.2, color: "rgba(45,36,26,0.55)", textTransform: "uppercase" }}>
                HEARTLOOM
              </Text>
              <Feather name="bell" size={17} color="rgba(45,36,26,0.55)" />
            </View>

            {/* Hero text */}
            <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 24 }}>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 26, fontWeight: "500", color: "#FFFFFF", lineHeight: 33, marginBottom: 9 }}>
                Opportunities{"\n"}to say{" "}
                <Text style={{ fontStyle: "italic", color: "rgba(255,255,255,0.82)" }}>I love you.</Text>
              </Text>
              <Text style={{ fontSize: 12.5, lineHeight: 19, color: "rgba(255,255,255,0.78)", maxWidth: 280 }}>
                Gentle cues for the moments that matter — birthdays, milestones, quiet Sundays.
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>

        {/* Wave transition */}
        <View style={{ height: 32, backgroundColor: BUTTER, borderTopLeftRadius: 600, borderTopRightRadius: 600, marginTop: -2 }} />

        {/* ── Butter/cream body ── */}
        <Animated.View style={{ backgroundColor: BUTTER, opacity, transform: [{ translateY: slideY }] }}>

          {/* Chart card */}
          <View style={{ marginHorizontal: 18, marginTop: -10, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, shadowColor: INK, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 6, marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: INK }}>Engagement this week</Text>
              <Text style={{ color: INK_MUTED, fontSize: 14 }}>›</Text>
            </View>
            {/* Simple bar chart */}
            <View style={{ height: 72, flexDirection: "row", alignItems: "flex-end", gap: 6, paddingHorizontal: 4 }}>
              {CHART_BARS.map((h, i) => (
                <View key={i} style={{ flex: 1, height: `${h}%` as any, backgroundColor: i === 3 ? AMBER : "#E8A851", borderRadius: 3, opacity: i === 3 ? 1 : 0.65 }} />
              ))}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 4 }}>
              {["Mon", "Thu", "Tue", "Wed"].map((d) => (
                <Text key={d} style={{ fontSize: 8, color: INK_MUTED }}>{d}</Text>
              ))}
            </View>
          </View>

          {/* Context-aware card */}
          <View style={{ marginHorizontal: 18, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderLeftWidth: 3, borderLeftColor: AMBER, shadowColor: INK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: BUTTER, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 13, color: AMBER_DEEP }}>✉</Text>
              </View>
              <Text style={{ fontSize: 11.5, fontWeight: "700", color: INK, flex: 1 }}>Context-aware{"\n"}message</Text>
              <Text style={{ color: INK_MUTED, fontSize: 16 }}>×</Text>
            </View>
            <Text style={{ fontSize: 11, lineHeight: 16, color: INK_SOFT, marginBottom: 12 }}>
              Gentle prompts suggest the right moment to send a note, based on upcoming family milestones.
            </Text>
            {/* Message input */}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CREAM, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8 }}>
              <TextInput
                placeholder="Write a message…"
                placeholderTextColor={INK_MUTED}
                style={{ flex: 1, fontSize: 11.5, color: INK_SOFT }}
                editable={false}
              />
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#FFFFFF", fontSize: 10 }}>➤</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.07)", marginHorizontal: 20, marginBottom: 20 }} />

          {/* Upcoming section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: INK_MUTED, fontWeight: "700", marginBottom: 12 }}>
              Upcoming
            </Text>
            <View style={{ gap: 8 }}>
              {UPCOMING.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push("/letter")}
                  style={({ pressed }) => ({
                    backgroundColor: "#EBE0CA",
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                    opacity: pressed ? 0.85 : 1,
                    borderWidth: 1,
                    borderColor: "rgba(45,36,26,0.06)",
                  })}
                >
                  {/* Date badge */}
                  <View style={{ backgroundColor: "#6F8564", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, alignItems: "center", minWidth: 40 }}>
                    <Text style={{ fontFamily: "Georgia", fontSize: 18, fontWeight: "600", color: "#FFFFFF", lineHeight: 20 }}>{item.day}</Text>
                    <Text style={{ fontSize: 7.5, letterSpacing: 1.5, color: "rgba(255,255,255,0.85)", marginTop: 1 }}>{item.month}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: INK, marginBottom: 2 }}>{item.title}</Text>
                    <Text style={{ fontSize: 10, color: INK_SOFT }}>{item.sub}</Text>
                  </View>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.dot }} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.07)", marginHorizontal: 20, marginBottom: 20 }} />

          {/* Audio legacy */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
            {/* Today's prompt */}
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: AMBER, marginBottom: 14, shadowColor: INK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
              <Text style={{ fontSize: 8.5, fontWeight: "700", letterSpacing: 1.8, color: AMBER_DEEP, marginBottom: 5 }}>TODAY'S PROMPT</Text>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 13.5, lineHeight: 19, color: INK, fontWeight: "500" }}>
                "Tell me about the first home you ever loved."
              </Text>
            </View>

            {/* Record button */}
            <Pressable
              onPress={() => router.push({ pathname: "/record", params: { promptId: "2" } })}
              style={({ pressed }) => ({
                alignItems: "center",
                marginBottom: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: AMBER, alignItems: "center", justifyContent: "center", shadowColor: AMBER, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6, borderWidth: 4, borderColor: "rgba(210,127,20,0.2)" }}>
                <View style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: "#FFFFFF" }} />
              </View>
              <Text style={{ marginTop: 8, fontSize: 10.5, color: INK_SOFT, letterSpacing: 0.5 }}>Tap to record</Text>
            </Pressable>

            {/* Saved stories */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontFamily: "Georgia", fontWeight: "500", color: INK }}>Saved stories</Text>
              <Pressable onPress={() => router.push("/stories")} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ fontSize: 10, color: AMBER_DEEP, fontWeight: "500", textDecorationLine: "underline" }}>See all</Text>
              </Pressable>
            </View>
            <View style={{ gap: 8 }}>
              {AUDIO_STORIES.map((story) => (
                <Pressable
                  key={story.id}
                  onPress={() => router.push("/stories")}
                  style={({ pressed }) => ({
                    backgroundColor: "#FFFFFF",
                    borderRadius: 13,
                    padding: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    opacity: pressed ? 0.85 : 1,
                    shadowColor: INK,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  })}
                >
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 9, marginLeft: 1 }}>▶</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Georgia", fontSize: 12, fontWeight: "600", color: INK }}>{story.title}</Text>
                    <Text style={{ fontSize: 9.5, color: INK_MUTED, marginTop: 1 }}>{story.person} · {story.duration}</Text>
                  </View>
                  {/* Mini waveform */}
                  <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
                    {[7, 12, 18, 10, 15, 8].map((h, i) => (
                      <View key={i} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: "#8B6039", opacity: 0.55 }} />
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
