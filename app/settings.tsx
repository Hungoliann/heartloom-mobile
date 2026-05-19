import { useRef, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/auth.store";

const AMBER = "#D27F14";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const TERRA = "#B86241";

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleSignOut() {
    signOut();
    router.replace("/(auth)/sign-in");
  }

  const initial = (user?.name ?? "E").charAt(0).toUpperCase();

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
          <Text style={{ fontSize: 17, fontFamily: "Georgia", fontWeight: "600", color: INK }}>Settings</Text>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {/* Profile card */}
          <View
            style={{
              margin: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              shadowColor: INK,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: AMBER, alignItems: "center", justifyContent: "center", shadowColor: AMBER, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3 }}>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontWeight: "700", fontSize: 22, color: "#FFFFFF" }}>
                {initial}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontFamily: "Georgia", fontWeight: "600", color: INK }}>{user?.name ?? "Eleanor M. Hayes"}</Text>
              <Text style={{ fontSize: 12, color: INK_MUTED, marginTop: 2 }}>{user?.email ?? "eleanor@example.com"}</Text>
            </View>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}>
              <Feather name="edit-2" size={16} color={INK_MUTED} />
            </Pressable>
          </View>

          {/* Account */}
          <Section label="Account">
            {[
              { icon: "user", label: "Edit profile" },
              { icon: "shield", label: "Privacy & security" },
              { icon: "lock", label: "Change password" },
              { icon: "users", label: "Manage family circle" },
            ].map((row) => (
              <SettingsRow key={row.label} icon={row.icon} label={row.label} />
            ))}
          </Section>

          {/* Notifications */}
          <Section label="Notifications">
            <ToggleRow
              label="Push notifications"
              sub="Letter delivery & family activity"
              value={pushEnabled}
              onChange={setPushEnabled}
            />
            <ToggleRow
              label="Email reminders"
              sub="Upcoming milestones & prompts"
              value={emailEnabled}
              onChange={setEmailEnabled}
            />
            <ToggleRow
              label="Captions, always on"
              sub="Every recording, transcribed."
              value={captionsEnabled}
              onChange={setCaptionsEnabled}
            />
          </Section>

          {/* About */}
          <Section label="About">
            {[
              { icon: "help-circle", label: "Help & support" },
              { icon: "file-text", label: "Terms of service" },
              { icon: "eye-off", label: "Privacy policy" },
              { icon: "info", label: "About Heartloom" },
            ].map((row) => (
              <SettingsRow key={row.label} icon={row.icon} label={row.label} />
            ))}
          </Section>

          {/* Sign out */}
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="log-out" size={16} color={TERRA} />
              <Text style={{ fontSize: 14, color: TERRA, fontWeight: "500" }}>Sign out</Text>
            </Pressable>
            <Text style={{ fontSize: 11, color: INK_MUTED }}>Heartloom v1.0.0</Text>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", color: "#8A7A66", marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, overflow: "hidden", shadowColor: "#2D241A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({ icon, label }: { icon: string; label: string }) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(45,36,26,0.06)",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Feather name={icon as any} size={16} color="#8A7A66" />
      <Text style={{ flex: 1, fontSize: 14, color: "#4A3D2E" }}>{label}</Text>
      <Feather name="chevron-right" size={15} color="#8A7A66" />
    </Pressable>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(45,36,26,0.06)",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: "#4A3D2E" }}>{label}</Text>
        <Text style={{ fontSize: 11, color: "#8A7A66", marginTop: 2 }}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(45,36,26,0.15)", true: "#D27F14" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
