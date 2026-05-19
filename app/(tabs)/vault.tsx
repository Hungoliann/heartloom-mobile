import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const CATEGORIES = [
  {
    id: "1",
    title: "Will & Testament",
    description: "Your final wishes and estate",
    emoji: "📜",
    count: 1,
    status: "complete",
    color: "#B86241",
    bg: "#F5E5DA",
  },
  {
    id: "2",
    title: "Health Directive",
    description: "Medical and end-of-life care",
    emoji: "🏥",
    count: 2,
    status: "complete",
    color: "#8BAE72",
    bg: "#EEF5E8",
  },
  {
    id: "3",
    title: "Financial Records",
    description: "Accounts, assets, and debts",
    emoji: "📊",
    count: 0,
    status: "empty",
    color: "#2B4D61",
    bg: "#D8E8F0",
  },
  {
    id: "4",
    title: "Funeral Wishes",
    description: "Ceremony, burial, and tributes",
    emoji: "🕊️",
    count: 1,
    status: "draft",
    color: "#2D4530",
    bg: "#DEE9DF",
  },
  {
    id: "5",
    title: "Important Notes",
    description: "Messages, passwords, and more",
    emoji: "📝",
    count: 3,
    status: "complete",
    color: "#8C7B65",
    bg: "#F0EAE0",
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  complete: { label: "Complete", color: "#5C7A45", bg: "#EEF5E8" },
  draft: { label: "In progress", color: "#B8863C", bg: "#FBF0D9" },
  empty: { label: "Not started", color: "#8C7B65", bg: "#F0EAE0" },
};

export default function VaultScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const completedCount = CATEGORIES.filter((c) => c.status === "complete").length;
  const progress = completedCount / CATEGORIES.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF6EE" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8C7B65", marginBottom: 6 }}>
                Secured documents
              </Text>
              <Text style={{ fontFamily: "Georgia", fontSize: 28, color: "#2C1F0E", lineHeight: 34 }}>
                Your Vault
              </Text>
              <Text style={{ fontSize: 14, color: "#8C7B65", marginTop: 6 }}>
                Documents and wishes, kept safe
              </Text>
            </View>

            {/* Progress card */}
            <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 24 }}>
              <View
                style={{
                  backgroundColor: "#2C1F0E",
                  borderRadius: 20,
                  padding: 24,
                  shadowColor: "#2C1F0E",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.22,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, marginBottom: 4 }}>
                      Vault completeness
                    </Text>
                    <Text style={{ fontFamily: "Georgia", fontSize: 32, color: "#D4A853", fontWeight: "300" }}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
                    <Feather name="shield" size={20} color="#D4A853" />
                  </View>
                </View>

                {/* Progress bar */}
                <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 12 }}>
                  <View
                    style={{
                      height: 4,
                      width: `${progress * 100}%`,
                      backgroundColor: "#D4A853",
                      borderRadius: 2,
                    }}
                  />
                </View>

                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  {completedCount} of {CATEGORIES.length} sections complete
                </Text>
              </View>
            </View>

            {/* Category cards */}
            <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
              <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 14 }}>
                Documents
              </Text>
            </View>

            <View style={{ paddingHorizontal: 20, gap: 12 }}>
              {CATEGORIES.map((cat) => {
                const statusMeta = STATUS_LABELS[cat.status];
                return (
                  <Pressable
                    key={cat.id}
                    style={({ pressed }) => ({
                      backgroundColor: "#FFFFFF",
                      borderRadius: 18,
                      padding: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      borderWidth: 1.5,
                      borderColor: "#EDE4D4",
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      shadowColor: "#2C1F0E",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.07,
                      shadowRadius: 8,
                      elevation: 3,
                    })}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        backgroundColor: cat.bg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, color: "#2C1F0E", fontWeight: "600", marginBottom: 3 }}>
                        {cat.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#8C7B65", marginBottom: 8 }}>{cat.description}</Text>
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: statusMeta.bg,
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "600", color: statusMeta.color }}>
                          {cat.count > 0 ? `${cat.count} file${cat.count > 1 ? "s" : ""} · ` : ""}{statusMeta.label}
                        </Text>
                      </View>
                    </View>

                    <Feather name="chevron-right" size={18} color="#C4B8A6" />
                  </Pressable>
                );
              })}
            </View>

            {/* Upload button */}
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: "#F5EDD6",
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: "#D4A853",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Feather name="upload" size={18} color="#D4A853" />
                <Text style={{ fontSize: 15, color: "#D4A853", fontWeight: "600" }}>Upload a document</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
