import { useRef, useEffect, useState } from "react";
import { View, Text, Pressable, Animated, Switch, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/auth.store";
import { supabase } from "../src/lib/supabase";
import { Colors } from "../src/constants/colors";

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

  function sendPasswordReset() {
    supabase.auth.resetPasswordForEmail(user?.email ?? "");
  }

  function handleChangePassword() {
    Alert.alert(
      "Change Password",
      "A password reset email will be sent to your account email.",
      [
        { text: "Send email", onPress: sendPasswordReset },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  const initial = (user?.name ?? "E").charAt(0).toUpperCase();

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
          <Text style={{ fontSize: 17, fontFamily: "Georgia", fontWeight: "600", color: Colors.ink }}>Settings</Text>
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
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              shadowColor: Colors.ink,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.amber, alignItems: "center", justifyContent: "center", shadowColor: Colors.amber, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3 }}>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontWeight: "700", fontSize: 22, color: Colors.white }}>
                {initial}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontFamily: "Georgia", fontWeight: "600", color: Colors.ink }}>{user?.name ?? "Eleanor M. Hayes"}</Text>
              <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{user?.email ?? "eleanor@example.com"}</Text>
            </View>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}>
              <Feather name="edit-2" size={16} color={Colors.inkMuted} />
            </Pressable>
          </View>

          {/* Account */}
          <Section label="Account">
            <SettingsRow icon="user" label="Edit profile" onPress={() => router.push("/(tabs)/family")} />
            <SettingsRow icon="shield" label="Privacy & security" onPress={() => router.push("/privacy")} />
            <SettingsRow icon="lock" label="Change password" onPress={handleChangePassword} />
            <SettingsRow icon="users" label="Manage family circle" onPress={() => router.push("/(tabs)/family")} />
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
            <SettingsRow icon="help-circle" label="Help & support" onPress={() => Linking.openURL("mailto:support@heartloom.com")} />
            <SettingsRow icon="file-text" label="Terms of service" onPress={() => router.push("/terms")} />
            <SettingsRow icon="eye-off" label="Privacy policy" onPress={() => router.push("/privacy")} />
            <SettingsRow
              icon="info"
              label="About Heartloom"
              onPress={() => Alert.alert("Heartloom", "Version 1.0.0\n\nBuilding heirlooms that last.")}
            />
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
              <Feather name="log-out" size={16} color={Colors.terra} />
              <Text style={{ fontSize: 14, color: Colors.terra, fontWeight: "500" }}>Sign out</Text>
            </Pressable>
            <Text style={{ fontSize: 11, color: Colors.inkMuted }}>Heartloom v1.0.0</Text>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ backgroundColor: Colors.white, borderRadius: 14, overflow: "hidden", shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
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
      <Feather name={icon as any} size={16} color={Colors.inkMuted} />
      <Text style={{ flex: 1, fontSize: 14, color: Colors.inkSoft }}>{label}</Text>
      <Feather name="chevron-right" size={15} color={Colors.inkMuted} />
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
        <Text style={{ fontSize: 14, color: Colors.inkSoft }}>{label}</Text>
        <Text style={{ fontSize: 11, color: Colors.inkMuted, marginTop: 2 }}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(45,36,26,0.15)", true: Colors.amber }}
        thumbColor={Colors.white}
      />
    </View>
  );
}
