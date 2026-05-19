import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const LETTERS = [
  {
    id: "1",
    for: "Maya",
    title: "On your 18th birthday",
    deliverAt: "June 14, 2031",
    deliverLabel: "In 5 years",
    status: "sealed",
    duration: "8 min",
    preview: "There's so much I want you to know when you reach this day...",
    color: "#D4A853",
    emoji: "🌸",
  },
  {
    id: "2",
    for: "James",
    title: "When you meet someone special",
    deliverAt: "Milestone",
    deliverLabel: "On a milestone",
    status: "sealed",
    duration: "12 min",
    preview: "I've been thinking about what I'd tell you about love...",
    color: "#8BAE72",
    emoji: "💛",
  },
  {
    id: "3",
    for: "Mom",
    title: "Everything I never said",
    deliverAt: "Delivered Aug 12, 2024",
    deliverLabel: "Delivered",
    status: "delivered",
    duration: "6 min",
    preview: "I've been carrying these words for a long time...",
    color: "#B86241",
    emoji: "🍂",
  },
  {
    id: "4",
    for: "Everyone",
    title: "A note for the whole family",
    deliverAt: "Christmas 2025",
    deliverLabel: "Dec 25, 2025",
    status: "sealed",
    duration: "15 min",
    preview: "This one's for all of you, whenever you need it...",
    color: "#2B4D61",
    emoji: "🕊️",
  },
];

export default function LegacyScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF6EE" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
            <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8C7B65", marginBottom: 6 }}>
              Your archive
            </Text>
            <Text style={{ fontFamily: "Georgia", fontSize: 28, color: "#2C1F0E", lineHeight: 34 }}>
              Future Letters
            </Text>
            <Text style={{ fontSize: 14, color: "#8C7B65", marginTop: 6 }}>
              {LETTERS.filter((l) => l.status === "sealed").length} sealed · {LETTERS.filter((l) => l.status === "delivered").length} delivered
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", marginHorizontal: 20, gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total", value: LETTERS.length.toString(), color: "#2C1F0E" },
              { label: "Sealed", value: LETTERS.filter((l) => l.status === "sealed").length.toString(), color: "#D4A853" },
              { label: "Delivered", value: LETTERS.filter((l) => l.status === "delivered").length.toString(), color: "#8BAE72" },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#EDE4D4" }}
              >
                <Text style={{ fontFamily: "Georgia", fontSize: 22, color: stat.color, fontWeight: "600" }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: "#8C7B65", marginTop: 2, letterSpacing: 0.5 }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Letters list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 32 }}>
            {LETTERS.map((letter, index) => (
              <Animated.View
                key={letter.id}
                style={{ opacity, transform: [{ translateY: translateY }] }}
              >
                <Pressable
                  style={({ pressed }) => ({
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 1.5,
                    borderColor: "#EDE4D4",
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    shadowColor: "#2C1F0E",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.07,
                    shadowRadius: 10,
                    elevation: 3,
                  })}
                >
                  {/* Card header */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: letter.color + "22", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 20 }}>{letter.emoji}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 12, color: "#8C7B65" }}>For</Text>
                        <Text style={{ fontSize: 15, color: "#2C1F0E", fontWeight: "600" }}>{letter.for}</Text>
                      </View>
                    </View>

                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: letter.status === "delivered" ? "#8BAE7222" : "#D4A85322",
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: letter.status === "delivered" ? "#5C7A45" : "#B8863C" }}>
                        {letter.status === "delivered" ? "✓ Delivered" : "🔒 Sealed"}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 17, color: "#2C1F0E", lineHeight: 24, marginBottom: 8 }}>
                    "{letter.title}"
                  </Text>

                  {/* Preview */}
                  <Text style={{ fontSize: 13, color: "#8C7B65", lineHeight: 18, marginBottom: 14 }} numberOfLines={2}>
                    {letter.preview}
                  </Text>

                  {/* Footer */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F5EDD6", paddingTop: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Feather name={letter.status === "delivered" ? "check-circle" : "clock"} size={13} color={letter.status === "delivered" ? "#8BAE72" : "#D4A853"} />
                      <Text style={{ fontSize: 12, color: "#8C7B65" }}>{letter.deliverLabel}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#8C7B65" }}>{letter.duration}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Compose FAB */}
        <Pressable
          onPress={() => router.push("/record")}
          style={({ pressed }) => ({
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#D4A853",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.92 : 1 }],
            shadowColor: "#D4A853",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 8,
          })}
        >
          <Feather name="plus" size={26} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
