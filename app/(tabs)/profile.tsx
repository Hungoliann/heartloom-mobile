import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/auth.store";
import { Colors } from "../../src/constants/colors";

const PAPER = "#FFFAF0";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const waxScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.spring(waxScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }, 800);
  }, []);

  const ownerName = user?.name ?? "You";

  return (
    <View style={{ flex: 1, backgroundColor: "#F5E9D6" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Feather name="menu" size={18} color="rgba(58,38,22,0.55)" />
            <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 3.2, color: "rgba(58,38,22,0.55)", textTransform: "uppercase" }}>
              HEARTLOOM
            </Text>
            <Feather name="bell" size={17} color="rgba(58,38,22,0.55)" />
          </View>

          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
            {/* Lead question */}
            <View style={{ paddingHorizontal: 18, paddingBottom: 12 }}>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 16, lineHeight: 22, color: "#3A2616", fontWeight: "500" }}>
                What would you leave for{" "}
                <Text style={{ color: "#A95F0A", borderBottomWidth: 1, borderBottomColor: "rgba(169,95,10,0.4)" }}>the people you love most</Text>?
              </Text>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 10.5, lineHeight: 15, color: "rgba(74,47,24,0.6)", marginTop: 5 }}>
                Most families spend 18 months untangling. Yours can open a paragraph instead.
              </Text>
            </View>

            {/* Will document card */}
            <Pressable
              onPress={() => router.push("/letter")}
              style={{ marginHorizontal: 16, marginBottom: 14, position: "relative" }}
            >
              {/* Ambient glow */}
              <View style={{ position: "absolute", top: -10, left: -16, right: -16, bottom: -22, borderRadius: 20 }}>
                <View style={{ flex: 1, opacity: 0.18, backgroundColor: Colors.amber, borderRadius: 20 }} />
              </View>

              <View
                style={{
                  backgroundColor: Colors.parchment,
                  borderRadius: 6,
                  padding: 14,
                  paddingLeft: 20,
                  borderWidth: 1,
                  borderColor: "rgba(169,95,10,0.15)",
                  shadowColor: "#4A2F18",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 18,
                  elevation: 5,
                  overflow: "hidden",
                }}
              >
                {/* Left binding line */}
                <View style={{ position: "absolute", left: 10, top: 8, bottom: 8, width: 1, backgroundColor: "rgba(169,95,10,0.35)" }} />
                <View style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 1, backgroundColor: "rgba(169,95,10,0.18)" }} />

                {/* Wax seal (top right) */}
                <Animated.View
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#8A3A0E",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ scale: waxScale }, { rotate: "-12deg" }],
                    shadowColor: "#5E240A",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.55,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontWeight: "700", fontSize: 18, color: "#F3C896" }}>H</Text>
                </Animated.View>

                {/* Document header */}
                <View style={{ alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(169,95,10,0.12)", paddingRight: 44 }}>
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(74,47,24,0.55)", marginBottom: 3, fontWeight: "500" }}>
                    Last Will & Testament
                  </Text>
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 12, color: "rgba(74,47,24,0.7)", fontWeight: "500" }}>
                    of <Text style={{ fontFamily: "Georgia", fontStyle: "normal", fontSize: 17, color: "#4A2F18", fontWeight: "600" }}>{ownerName}</Text>
                  </Text>
                </View>

                {/* First entry (complete) */}
                <View style={{ marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(169,95,10,0.08)" }}>
                  <Text style={{ fontFamily: "Georgia", fontWeight: "600", fontSize: 10, color: "#4A2F18", marginBottom: 3 }}>To those I love</Text>
                  <Text style={{ fontFamily: "Georgia", fontSize: 14, lineHeight: 20, color: "#2B2118", fontWeight: "500" }}>
                    I leave everything that matters — the memories, the lessons, and the letters sealed with care.
                  </Text>
                  {/* Delivery pill */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6, alignSelf: "flex-start", backgroundColor: "#FFF5E3", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(169,95,10,0.3)" }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#A95F0A", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 7, color: "#FBE7C1" }}>✦</Text>
                    </View>
                    <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 9.5, color: "#6B3F10" }}>Sealed · opens when the time is right</Text>
                  </View>
                </View>

                {/* Second entry (in progress) */}
                <View style={{ marginBottom: 4 }}>
                  <Text style={{ fontFamily: "Georgia", fontWeight: "600", fontSize: 10, color: "#4A2F18", marginBottom: 3 }}>Your next letter</Text>
                  <Text style={{ fontFamily: "Georgia", fontSize: 14, lineHeight: 20, color: "#2B2118", fontWeight: "500" }}>
                    Start writing something meaningful…
                    <Text style={{ color: "#A95F0A" }}>|</Text>
                  </Text>
                </View>

                {/* Sign line */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(169,95,10,0.2)" }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: "rgba(74,47,24,0.35)" }} />
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 8, letterSpacing: 1.2, color: "rgba(74,47,24,0.55)", textTransform: "uppercase" }}>
                    Signed & notarized · Mar 14
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Progress bar */}
            <View style={{ paddingHorizontal: 18, marginBottom: 10 }}>
              <View style={{ height: 5, backgroundColor: "rgba(169,95,10,0.14)", borderRadius: 999, overflow: "hidden" }}>
                <View style={{ height: 5, width: "62%", backgroundColor: Colors.amber, borderRadius: 999 }} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 5 }}>
                <Text style={{ fontFamily: "Georgia", fontSize: 9.5, fontWeight: "700", letterSpacing: 0.8, color: "#4A2F18", textTransform: "uppercase" }}>Step 3 of 5</Text>
                <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 9.5, color: "rgba(74,47,24,0.55)" }}>· about 4 minutes left</Text>
              </View>
            </View>

            {/* CTA */}
            <View style={{ paddingHorizontal: 18, marginBottom: 10 }}>
              <Pressable
                onPress={() => router.push("/record")}
                style={({ pressed }) => ({
                  width: "100%",
                  padding: 13,
                  backgroundColor: "#4A2F18",
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.88 : 1,
                  shadowColor: "#4A2F18",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 14,
                  elevation: 5,
                })}
              >
                <Text style={{ fontFamily: "Georgia", fontWeight: "600", fontSize: 13, color: "#FBF2DD", letterSpacing: 0.2 }}>Continue where I left off</Text>
                <Text style={{ fontSize: 13, color: Colors.amber }}>→</Text>
              </Pressable>
            </View>

            {/* Trust line */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 20, marginBottom: 28 }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#6F8564", shadowColor: "#6F8564", shadowRadius: 4, shadowOpacity: 0.4 }} />
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 9.5, color: "rgba(74,47,24,0.62)", textAlign: "center", lineHeight: 14 }}>
                Reviewed by an estate attorney in California · Notarized in app
              </Text>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: "rgba(45,36,26,0.07)", marginHorizontal: 20, marginBottom: 20 }} />

            {/* My content links */}
            <View style={{ paddingHorizontal: 20, gap: 2, marginBottom: 24 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 8 }}>My Content</Text>
              {[
                { icon: "mail", label: "Future Letters", route: "/(tabs)/legacy" },
                { icon: "users", label: "Family", route: "/(tabs)/family" },
                { icon: "archive", label: "Vault", route: "/(tabs)/vault" },
              ].map((row) => (
                <Pressable
                  key={row.label}
                  onPress={() => router.push(row.route as any)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(45,36,26,0.06)",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Feather name={row.icon as any} size={16} color={Colors.amber} />
                  <Text style={{ flex: 1, fontSize: 13.5, color: Colors.inkSoft }}>{row.label}</Text>
                  <Feather name="chevron-right" size={15} color={Colors.inkMuted} />
                </Pressable>
              ))}
            </View>

            {/* Profile rows */}
            <View style={{ paddingHorizontal: 20, gap: 2, marginBottom: 20 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", color: Colors.inkMuted, marginBottom: 8 }}>Account</Text>
              {[
                { icon: "user", label: "Profile settings" },
                { icon: "shield", label: "Privacy & security" },
                { icon: "bell", label: "Notifications" },
                { icon: "help-circle", label: "Help & support" },
              ].map((row) => (
                <Pressable
                  key={row.label}
                  onPress={() => router.push("/settings")}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(45,36,26,0.06)",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Feather name={row.icon as any} size={16} color={Colors.inkMuted} />
                  <Text style={{ flex: 1, fontSize: 13.5, color: Colors.inkSoft }}>{row.label}</Text>
                  <Feather name="chevron-right" size={15} color={Colors.inkMuted} />
                </Pressable>
              ))}

              <Pressable
                onPress={() => { signOut(); router.replace("/(auth)/sign-in"); }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  marginTop: 8,
                  opacity: pressed ? 0.7 : 1,
                  borderRadius: 13,
                  borderWidth: 1.5,
                  borderColor: "rgba(184,98,65,0.3)",
                  backgroundColor: "rgba(184,98,65,0.06)",
                })}
              >
                <Feather name="log-out" size={16} color={Colors.terra} />
                <Text style={{ fontSize: 13.5, color: Colors.terra }}>Sign out</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
