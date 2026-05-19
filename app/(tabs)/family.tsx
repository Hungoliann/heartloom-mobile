import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const FAMILY = [
  { id: "1", name: "Sarah Mitchell", role: "You (Owner)", initials: "SM", color: "#D4A853", bg: "#FBF0D9" },
  { id: "2", name: "James Mitchell", role: "Partner", initials: "JM", color: "#8BAE72", bg: "#EEF5E8" },
  { id: "3", name: "Maya Mitchell", role: "Daughter", initials: "MM", color: "#B86241", bg: "#F5E5DA" },
  { id: "4", name: "Tom Mitchell", role: "Son", initials: "TM", color: "#2B4D61", bg: "#D8E8F0" },
];

const ACTIVITY = [
  { id: "1", name: "James", action: "listened to", item: "Sunday morning story", time: "2 days ago", emoji: "🎙️" },
  { id: "2", name: "Maya", action: "viewed your letter", item: "On your 18th birthday", time: "1 week ago", emoji: "✉️" },
  { id: "3", name: "Tom", action: "joined the family", item: "", time: "3 weeks ago", emoji: "🌿" },
];

export default function FamilyScreen() {
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8C7B65", marginBottom: 6 }}>
                Your circle
              </Text>
              <Text style={{ fontFamily: "Georgia", fontSize: 28, color: "#2C1F0E", lineHeight: 34, marginBottom: 4 }}>
                The Mitchells
              </Text>
              <Text style={{ fontSize: 14, color: "#8C7B65" }}>
                {FAMILY.length} members · Private family
              </Text>
            </View>

            {/* Family crest card */}
            <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 24 }}>
              <View
                style={{
                  backgroundColor: "#2D4530",
                  borderRadius: 20,
                  padding: 24,
                  alignItems: "center",
                  shadowColor: "#2D4530",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                {/* Avatar cluster */}
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  {FAMILY.map((member, i) => (
                    <View
                      key={member.id}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: member.color,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: i === 0 ? 0 : -14,
                        borderWidth: 2.5,
                        borderColor: "#2D4530",
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                        {member.initials}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={{ fontFamily: "Georgia", fontSize: 20, color: "#FFFFFF", marginBottom: 4 }}>
                  Mitchell Family
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                  Sharing memories since 2024
                </Text>

                <Pressable
                  style={({ pressed }) => ({
                    marginTop: 20,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Feather name="user-plus" size={16} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "500" }}>Invite a loved one</Text>
                </Pressable>
              </View>
            </View>

            {/* Members */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 14 }}>
                Members
              </Text>
              <View style={{ gap: 10 }}>
                {FAMILY.map((member) => (
                  <Pressable
                    key={member.id}
                    style={({ pressed }) => ({
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      borderWidth: 1,
                      borderColor: "#EDE4D4",
                      opacity: pressed ? 0.85 : 1,
                      shadowColor: "#2C1F0E",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 2,
                    })}
                  >
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: member.bg,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: member.color + "44",
                      }}
                    >
                      <Text style={{ color: member.color, fontWeight: "700", fontSize: 15 }}>
                        {member.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, color: "#2C1F0E", fontWeight: "600", marginBottom: 2 }}>
                        {member.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#8C7B65" }}>{member.role}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#C4B8A6" />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Activity feed */}
            <View style={{ paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 14 }}>
                Recent Activity
              </Text>
              <View style={{ gap: 10 }}>
                {ACTIVITY.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderWidth: 1,
                      borderColor: "#EDE4D4",
                    }}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#F5EDD6", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, color: "#2C1F0E", lineHeight: 20 }}>
                        <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                        {" "}{item.action}{item.item ? ` "${item.item}"` : ""}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#8C7B65", marginTop: 2 }}>{item.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
