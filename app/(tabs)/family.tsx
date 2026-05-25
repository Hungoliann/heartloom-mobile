import { useRef, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFamily } from "../../src/hooks/useFamily";
import { useAuthStore } from "../../src/store/auth.store";
import { supabase } from "../../src/lib/supabase";
import { Colors } from "../../src/constants/colors";

const AVATAR_COLORS = ["#D27F14", "#6F8564", "#B86241", "#4A3D2E", "#8A7A66"];
const AVATAR_BGS    = ["#FBF0D9", "#EEF5E8", "#F5E5DA", "#E8E2D8", "#F0EBE3"];

function getInitials(fullName: string | null): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function SkeletonRow() {
  return (
    <View
      style={{
        backgroundColor: Colors.white,
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

function InviteCard({ onPress }: { onPress: () => void }) {
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
          color: Colors.inkMuted,
          textAlign: "center",
        }}
      >
        Invite a loved one to share memories
      </Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: "#2D4530",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 20,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: Colors.white, fontSize: 13, fontWeight: "600" }}>Send an invite →</Text>
      </Pressable>
    </View>
  );
}

export default function FamilyScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const { data: members = [], isLoading } = useFamily();
  const user = useAuthStore((s) => s.user);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("family_id")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setFamilyId(data?.family_id ?? null));
  }, [user?.id]);

  async function handleInvite() {
    if (!familyId) {
      Alert.alert("Not ready", "Family data is still loading.");
      return;
    }
    const inviteCode = generateInviteCode();

    try {
      await Share.share({
        message: `I'd like you to join my family circle on Heartloom — a place to preserve memories and letters for the people we love.\n\nDownload Heartloom, then tap "Join a family" and enter this code:\n\n${inviteCode}`,
        title: "Join my Heartloom family",
      });
    } catch {
      // User dismissed share sheet — no action needed
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 6 }}>
                Your circle
              </Text>
              <Text style={{ fontFamily: "Georgia", fontSize: 28, color: Colors.ink, lineHeight: 34, marginBottom: 4 }}>
                The Family
              </Text>
              <Text style={{ fontSize: 14, color: Colors.inkMuted }}>
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
                        <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 14 }}>
                          {initials}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={{ fontFamily: "Georgia", fontSize: 20, color: Colors.white, marginBottom: 4 }}>
                  The Family
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                  Sharing memories together
                </Text>

                <Pressable
                  onPress={handleInvite}
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
                  <Feather name="user-plus" size={16} color={Colors.white} />
                  <Text style={{ color: Colors.white, fontSize: 14, fontWeight: "500" }}>Invite a loved one</Text>
                </Pressable>
              </View>
            </View>

            {/* Members */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 14 }}>
                Members
              </Text>

              {isLoading ? (
                <View style={{ gap: 10 }}>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </View>
              ) : members.length === 0 ? (
                <InviteCard onPress={handleInvite} />
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
                          backgroundColor: Colors.white,
                          borderRadius: 16,
                          padding: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 14,
                          borderWidth: 1,
                          borderColor: "#EDE4D4",
                          opacity: pressed ? 0.85 : 1,
                          shadowColor: Colors.ink,
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
                          <Text style={{ fontSize: 15, color: Colors.ink, fontWeight: "600", marginBottom: 2 }}>
                            {name}
                          </Text>
                          <Text style={{ fontSize: 13, color: Colors.inkMuted }}>Family member</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color="#C4B8A6" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Invite card (shown below members when there are members) */}
            {!isLoading && members.length > 0 && <InviteCard onPress={handleInvite} />}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
