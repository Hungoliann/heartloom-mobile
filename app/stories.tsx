import { useRef, useEffect } from "react";
import { View, Text, Pressable, Animated, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../src/constants/colors";
import { useLetters } from "../src/hooks/useLetters";
import { useAuthStore } from "../src/store/auth.store";

const STATIC_BARS = [8, 14, 18, 11, 15, 8, 12, 16, 9, 13];

export default function StoriesScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(18)).current;

  const { data: letters = [] } = useLetters();
  const user = useAuthStore((s) => s.user);
  const audioLetters = letters.filter((l) => l.media_type === "audio");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(45,36,26,0.07)" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="chevron-left" size={22} color={Colors.inkSoft} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontFamily: "Georgia", fontWeight: "600", color: Colors.ink }}>Saved Stories</Text>
            <Text style={{ fontSize: 10, color: Colors.inkMuted, marginTop: 1 }}>{audioLetters.length} recordings</Text>
          </View>
          <Pressable
            onPress={() => router.push("/record" as any)}
            style={({ pressed }) => ({
              backgroundColor: Colors.amber,
              borderRadius: 999,
              paddingVertical: 8,
              paddingHorizontal: 14,
              opacity: pressed ? 0.85 : 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            })}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white }} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.white }}>Record</Text>
          </Pressable>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
        >
          {audioLetters.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 }}>
              <Text style={{ fontFamily: "Georgia", fontSize: 17, color: Colors.ink, textAlign: "center", marginBottom: 8 }}>No recordings yet</Text>
              <Text style={{ fontSize: 13, color: Colors.inkMuted, textAlign: "center", lineHeight: 20 }}>Voice memories you record will appear here.</Text>
            </View>
          ) : (
            audioLetters.map((letter) => {
              const title = letter.title;
              const person = letter.recipient_name ?? "Family";
              const duration = "—";
              const date = new Date(letter.created_at!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const tag = letter.recipient_name ? `For ${letter.recipient_name}` : "For Family";
              const bars = STATIC_BARS;
              return (
                <Pressable
                  key={letter.id}
                  style={({ pressed }) => ({
                    backgroundColor: Colors.white,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "rgba(45,36,26,0.07)",
                    shadowColor: Colors.ink,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* Play button */}
                    <Pressable
                      onPress={() => Alert.alert("Play audio", "Audio playback coming soon.")}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "rgba(210,127,20,0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name="play"
                        size={16}
                        color={Colors.amber}
                        style={{ marginLeft: 2 }}
                      />
                    </Pressable>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontFamily: "Georgia", fontWeight: "600", color: Colors.ink, marginBottom: 2 }}>
                        {title}
                      </Text>
                      <Text style={{ fontSize: 10.5, color: Colors.inkMuted }}>{person} · {duration}</Text>
                    </View>

                    <View style={{ backgroundColor: "rgba(210,127,20,0.1)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 9, fontWeight: "600", color: Colors.amberDeep }}>{tag}</Text>
                    </View>
                  </View>

                  {/* Waveform */}
                  <View style={{ flexDirection: "row", gap: 2, alignItems: "center", marginTop: 12, paddingLeft: 56 }}>
                    {bars.map((h, i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          height: h,
                          borderRadius: 2,
                          backgroundColor: "#8B6039",
                          opacity: 0.28,
                        }}
                      />
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingLeft: 56 }}>
                    <Text style={{ fontSize: 9.5, color: Colors.inkMuted }}>{date}</Text>
                    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                      <Feather name="more-horizontal" size={16} color={Colors.inkMuted} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })
          )}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
