import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFamily } from "../../src/hooks/useFamily";

const AVATAR_COLORS = ["#D27F14", "#6F8564", "#B86241", "#4A3D2E", "#8A7A66"];
const AVATAR_BGS    = ["#FBF0D9", "#EEF5E8", "#F5E5DA", "#E8E2D8", "#F0EBE3"];

function getInitials(fullName: string | null): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

function SkeletonRow() {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        borderWidth: 1,
        borderColor: "#EDE4D4",
      }}
    >
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: "#EDE4D4" }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ height: 14, borderRadius: 7, backgroundColor: "#EDE4D4", width: "55%" }} />
        <View style={{ height: 12, borderRadius: 6, backgroundColor: "#F5EDD6", width: "35%" }} />
      </View>
    </View>
  );
}

function InviteCard() {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(74,47,24,0.18)",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text
        style={{
          fontFamily: "Georgia",
          fontStyle: "italic",
          fontSize: 14,
          color: "#8C7B65",
          textAlign: "center",
        }}
      >
        Invite a loved one to share memories
      </Text>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: "#2D4530",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 20,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>Send an invite →</Text>
      </Pressable>
    </View>
  );
}

export default function FamilyScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const { data: members = [], isLoading } = useFamily();

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
                The Family
              </Text>
              <Text style={{ fontSize: 14, color: "#8C7B65" }}>
                {isLoading ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""} · Private family`}
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
                  {(isLoading ? Array.from({ length: 3 }) : members).map((member, i) => {
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    const initials = member
                      ? getInitials((member as { full_name: string | null }).full_name)
                      : "·";
                    return (
                      <View
                        key={member ? (member as { id: string }).id : `skel-${i}`}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 26,
                          backgroundColor: member ? color : "rgba(255,255,255,0.15)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: i === 0 ? 0 : -14,
                          borderWidth: 2.5,
                          borderColor: "#2D4530",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                          {initials}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={{ fontFamily: "Georgia", fontSize: 20, color: "#FFFFFF", marginBottom: 4 }}>
                  The Family
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                  Sharing memories together
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

              {isLoading ? (
                <View style={{ gap: 10 }}>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </View>
              ) : members.length === 0 ? (
                <InviteCard />
              ) : (
                <View style={{ gap: 10 }}>
                  {members.map((member, i) => {
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    const bg    = AVATAR_BGS[i % AVATAR_BGS.length];
                    const name  = member.full_name ?? "Family Member";
                    const initials = getInitials(member.full_name);
                    return (
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
                            backgroundColor: bg,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 2,
                            borderColor: color + "44",
                          }}
                        >
                          <Text style={{ color, fontWeight: "700", fontSize: 15 }}>
                            {initials}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, color: "#2C1F0E", fontWeight: "600", marginBottom: 2 }}>
                            {name}
                          </Text>
                          <Text style={{ fontSize: 13, color: "#8C7B65" }}>Family member</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color="#C4B8A6" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Invite card (shown below members when there are members) */}
            {!isLoading && members.length > 0 && <InviteCard />}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
