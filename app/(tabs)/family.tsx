import { Pressable } from "../../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../../src/constants/fonts";
import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Share,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import {
  useFamily,
  useMyFamily,
  useCreateFamily,
  useCreateInvite,
  useAcceptInvite,
} from "../../src/hooks/useFamily";
import { useAuthStore } from "../../src/store/auth.store";
import { Colors } from "../../src/constants/colors";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: Colors.inkMuted,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: "#2D4530",
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 20,
        alignItems: "center",
        opacity: pressed || disabled ? 0.7 : 1,
      })}
    >
      <Text style={{ color: Colors.white, fontSize: 14, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.rule,
        paddingVertical: 13,
        paddingHorizontal: 20,
        alignItems: "center",
        opacity: pressed || disabled ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: 14, color: Colors.inkSoft, fontWeight: "500" }}>{label}</Text>
    </Pressable>
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
          fontFamily: SERIF_ITALIC,
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
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: Colors.white, fontSize: 13, fontWeight: "600", textAlign: "center" }}>
          Send an invite →
        </Text>
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  No-family onboarding panel                                         */
/* ------------------------------------------------------------------ */

function NoFamilyPanel() {
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [familyName, setFamilyName] = useState("");
  const [code, setCode] = useState("");

  const createFamily = useCreateFamily();
  const acceptInvite = useAcceptInvite();

  async function handleCreate() {
    try {
      await createFamily.mutateAsync(familyName);
      setFamilyName("");
      setMode("idle");
    } catch (e: any) {
      Alert.alert("Could not create family", e?.message ?? "Please try again.");
    }
  }

  async function handleJoin() {
    try {
      await acceptInvite.mutateAsync(code);
      setCode("");
      setMode("idle");
      Alert.alert("Joined!", "You've been added to the family circle.");
    } catch (e: any) {
      Alert.alert("Invalid code", e?.message ?? "Please check the code and try again.");
    }
  }

  return (
    <View style={{ marginHorizontal: 20, marginTop: 12, gap: 14 }}>
      <View
        style={{
          backgroundColor: Colors.white,
          borderRadius: 18,
          padding: 20,
          borderWidth: 1,
          borderColor: "#EDE4D4",
          gap: 12,
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 20, color: Colors.ink }}>
          Start your family circle
        </Text>
        <Text style={{ fontSize: 14, color: Colors.inkMuted, lineHeight: 20 }}>
          You're not part of a family yet. Create one to begin, or join one with an invite code.
        </Text>

        {mode === "idle" && (
          <View style={{ gap: 10, marginTop: 4 }}>
            <PrimaryButton label="Create a family" onPress={() => setMode("create")} />
            <SecondaryButton label="Join with an invite code" onPress={() => setMode("join")} />
          </View>
        )}

        {mode === "create" && (
          <View style={{ gap: 10, marginTop: 4 }}>
            <Text style={{ fontSize: 13, color: Colors.inkSoft, fontWeight: "500" }}>
              Family name
            </Text>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="e.g. The Smiths"
              placeholderTextColor={Colors.inkMuted}
              autoCapitalize="words"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: Colors.rule,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                fontSize: 15,
                color: Colors.ink,
                backgroundColor: Colors.cream,
              }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  label="Cancel"
                  onPress={() => {
                    setMode("idle");
                    setFamilyName("");
                  }}
                  disabled={createFamily.isPending}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label={createFamily.isPending ? "Creating…" : "Create"}
                  onPress={handleCreate}
                  disabled={createFamily.isPending || !familyName.trim()}
                />
              </View>
            </View>
          </View>
        )}

        {mode === "join" && (
          <View style={{ gap: 10, marginTop: 4 }}>
            <Text style={{ fontSize: 13, color: Colors.inkSoft, fontWeight: "500" }}>
              Invite code
            </Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="ABC123"
              placeholderTextColor={Colors.inkMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={{
                borderWidth: 1,
                borderColor: Colors.rule,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                fontSize: 18,
                letterSpacing: 4,
                textAlign: "center",
                color: Colors.ink,
                backgroundColor: Colors.cream,
                fontWeight: "600",
              }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  label="Cancel"
                  onPress={() => {
                    setMode("idle");
                    setCode("");
                  }}
                  disabled={acceptInvite.isPending}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label={acceptInvite.isPending ? "Joining…" : "Join"}
                  onPress={handleJoin}
                  disabled={acceptInvite.isPending || code.trim().length < 4}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Owner invite-code section                                          */
/* ------------------------------------------------------------------ */

function InviteCodePanel({ familyId }: { familyId: string }) {
  const createInvite = useCreateInvite();
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    try {
      const invite = await createInvite.mutateAsync(familyId);
      setCurrentCode(invite.invite_code);
      setCopied(false);
    } catch (e: any) {
      Alert.alert("Could not generate code", e?.message ?? "Please try again.");
    }
  }

  async function handleCopy() {
    if (!currentCode) return;
    await Clipboard.setStringAsync(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareCode() {
    if (!currentCode) return;
    try {
      await Share.share({
        message: `Join my family on Heartloom — open the app, tap "Join a family" and enter this code:\n\n${currentCode}`,
        title: "Join my Heartloom family",
      });
    } catch {}
  }

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 8,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EDE4D4",
        backgroundColor: Colors.white,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.ink }}>
        Invite codes
      </Text>
      <Text style={{ fontSize: 13, color: Colors.inkMuted, lineHeight: 19 }}>
        Generate a 6-character code valid for 7 days. Share it with someone you want to add to your family.
      </Text>

      {currentCode ? (
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => ({
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.rule,
              backgroundColor: Colors.cream,
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 26,
                letterSpacing: 8,
                fontWeight: "700",
                color: Colors.ink,
                fontVariant: ["tabular-nums"],
              }}
            >
              {currentCode}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: Colors.inkMuted }}>
              {copied ? "Copied!" : "Tap to copy"}
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <SecondaryButton label="Share…" onPress={handleShareCode} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={createInvite.isPending ? "…" : "New code"}
                onPress={handleGenerate}
                disabled={createInvite.isPending}
              />
            </View>
          </View>
        </View>
      ) : (
        <PrimaryButton
          label={createInvite.isPending ? "Generating…" : "Generate invite code"}
          onPress={handleGenerate}
          disabled={createInvite.isPending}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Join with code (when already lacking permission etc. — kept for     */
/*  members who haven't created a family but here we render inside the  */
/*  has-family flow only as a leave action area).                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Main screen                                                        */
/* ------------------------------------------------------------------ */

export default function FamilyScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const { data: members = [], isLoading: membersLoading } = useFamily();
  const { data: myFamily, isLoading: familyLoading } = useMyFamily();
  const user = useAuthStore((s) => s.user);

  const isOwner = !!(myFamily && user && myFamily.owner_id === user.id);
  const isLoading = familyLoading || membersLoading;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleShareInvite() {
    if (!myFamily) return;
    // Share button on the crest just routes to the InviteCodePanel area —
    // but for owners we can quickly create + share in one go via Share sheet.
    Alert.alert(
      "Invite a loved one",
      "Scroll down to the 'Invite codes' section to generate a code you can share."
    );
  }

  // --- Loading state -------------------------------------------------
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cream }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 6 }}>
                Your circle
              </Text>
              <Text style={{ fontFamily: SERIF, fontSize: 28, color: Colors.ink, lineHeight: 34, marginBottom: 4 }}>
                The Family
              </Text>
              <Text style={{ fontSize: 14, color: Colors.inkMuted }}>Loading…</Text>
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 10 }}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // --- No family -----------------------------------------------------
  if (!myFamily) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cream }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
              <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
                <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 6 }}>
                  Your circle
                </Text>
                <Text style={{ fontFamily: SERIF, fontSize: 28, color: Colors.ink, lineHeight: 34, marginBottom: 4 }}>
                  The Family
                </Text>
                <Text style={{ fontSize: 14, color: Colors.inkMuted }}>
                  Begin by creating or joining a family
                </Text>
              </View>
              <NoFamilyPanel />
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // --- Has a family --------------------------------------------------
  const familyName = myFamily.name ?? "The Family";

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
              <Text style={{ fontFamily: SERIF, fontSize: 28, color: Colors.ink, lineHeight: 34, marginBottom: 4 }}>
                {familyName}
              </Text>
              <Text style={{ fontSize: 14, color: Colors.inkMuted }}>
                {`${members.length} member${members.length !== 1 ? "s" : ""} · ${isOwner ? "Owner" : "Member"}`}
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
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  {(members.length ? members : [null, null, null]).map((member, i) => {
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

                <Text style={{ fontFamily: SERIF, fontSize: 20, color: Colors.white, marginBottom: 4 }}>
                  {familyName}
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                  Sharing memories together
                </Text>

                {isOwner && (
                  <Pressable
                    onPress={handleShareInvite}
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
                )}
              </View>
            </View>

            {/* Owner-only invite code panel */}
            {isOwner && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ paddingHorizontal: 24 }}>
                  <SectionLabel>Share access</SectionLabel>
                </View>
                <InviteCodePanel familyId={myFamily.id} />
              </View>
            )}

            {/* Members */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 14 }}>
                Members
              </Text>

              {members.length === 0 ? (
                <Text style={{ fontSize: 14, color: Colors.inkMuted }}>
                  No members yet.
                </Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {members.map((member, i) => {
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    const bg    = AVATAR_BGS[i % AVATAR_BGS.length];
                    const name  = member.full_name ?? "Family Member";
                    const initials = getInitials(member.full_name);
                    const memberIsOwner = member.id === myFamily.owner_id;
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
                          <Text style={{ fontSize: 13, color: Colors.inkMuted }}>
                            {memberIsOwner ? "Owner" : "Family member"}
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={16} color="#C4B8A6" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Invite card below members for owners */}
            {isOwner && members.length > 0 && <InviteCard onPress={handleShareInvite} />}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
