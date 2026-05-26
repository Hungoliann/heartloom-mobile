import { Pressable } from "../../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../../src/constants/fonts";
import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/auth.store";
import { usePinnedLetter } from "../../src/hooks/useLetters";
import { Colors } from "../../src/constants/colors";


function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const UTILITY_SUGGESTIONS = [
  {
    id: "1",
    icon: "⊞",
    title: "Medicare Benefit Optimization",
    sub: "Review Parts A–D · we flagged 2 unused benefits",
    route: "/(tabs)/concierge" as const,
  },
  {
    id: "2",
    icon: "§",
    title: "Digital Will Integration",
    sub: "Notarized in 12 states · 18 minutes to draft",
    route: "/(tabs)/concierge" as const,
  },
  {
    id: "3",
    icon: "⚶",
    title: "Estate Executor Access",
    sub: "Name 1 person · they unlock only when needed",
    route: "/(tabs)/concierge" as const,
  },
  {
    id: "4",
    icon: "✤",
    title: "Hospice Benefits Review",
    sub: "Eligibility + paperwork walkthrough · with a real human",
    route: "/(tabs)/concierge" as const,
  },
];

const SOFT_SUGGESTIONS = [
  {
    id: "5",
    icon: "✏",
    title: "A recipe to pass down",
    sub: "5 minutes · voice + photo",
    route: "/record" as const,
  },
  {
    id: "6",
    icon: "✉",
    title: "Send a Gift Letter",
    sub: "For a parent or grandparent · $49",
    route: "/letter" as const,
  },
];

function SuggestRow({
  icon,
  title,
  sub,
  onPress,
  variant,
}: {
  icon: string;
  title: string;
  sub: string;
  onPress: () => void;
  variant: "utility" | "soft";
}) {
  const iconColor = variant === "utility" ? Colors.amberDeep : Colors.sageDeep;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.rule,
        borderRadius: 12,
        backgroundColor: Colors.paper,
        opacity: pressed ? 0.88 : 1,
        transform: pressed ? [{ scale: 0.985 }] : [{ scale: 1 }],
      })}
    >
      {/* Icon circle */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: Colors.cream,
          borderWidth: 1,
          borderColor: Colors.rule,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 14, color: iconColor }}>{icon}</Text>
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: SERIF,
            color: Colors.ink,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 11.5, color: Colors.inkMuted }}>{sub}</Text>
      </View>

      {/* Arrow */}
      <Text style={{ fontSize: 18, color: Colors.inkMuted, lineHeight: 22, paddingRight: 2 }}>›</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "Friend";
  const { data: pinnedLetter } = usePinnedLetter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    const runPulse = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 2.0, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.55, duration: 0, useNativeDriver: true }),
        ]),
      ]).start(() => runPulse());
    };
    const t = setTimeout(runPulse, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>

            {/* ── Header ── */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.cream,
                borderBottomWidth: 1,
                borderBottomColor: Colors.rule,
              }}
            >
              {/* Menu button */}
              <Pressable
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  borderWidth: 1,
                  borderColor: Colors.rule,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 16, color: Colors.inkSoft }}>☰</Text>
              </Pressable>

              {/* Wordmark */}
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  letterSpacing: 4.5,
                  textAlign: "center",
                  fontFamily: SERIF,
                  color: Colors.ink,
                }}
              >
                HEARTLOOM
              </Text>

              {/* Heart / notifications */}
              <Pressable
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 18, color: Colors.inkSoft }}>♡</Text>
              </Pressable>
            </View>

            {/* ── Greeting ── */}
            <View style={{ paddingHorizontal: 22, paddingTop: 22, gap: 4 }}>
              <Text
                style={{
                  fontFamily: SERIF_ITALIC,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: Colors.inkSoft,
                }}
              >
                {getGreeting()}, {firstName}.
              </Text>
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 30,
                  fontWeight: "500",
                  color: Colors.ink,
                  letterSpacing: -0.3,
                  marginBottom: 12,
                }}
              >
                Your{" "}
                <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>Heartloom.</Text>
              </Text>
            </View>

            {/* ── Pinned Letter Card ── */}
            {pinnedLetter ? (
              <Pressable
                onPress={() => router.push({ pathname: "/letter", params: { letterId: pinnedLetter!.id } } as any)}
                style={({ pressed }) => ({
                  marginHorizontal: 22,
                  marginBottom: 14,
                  borderRadius: 16,
                  backgroundColor: Colors.ink,
                  padding: 14,
                  gap: 8,
                  opacity: pressed ? 0.92 : 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.22,
                  shadowRadius: 14,
                  elevation: 6,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 34, height: 34, borderRadius: 17,
                      backgroundColor: "#B86241", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontWeight: "700", fontSize: 16, color: "#FFF7E9" }}>H</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: SERIF_ITALIC, fontSize: 15, color: "rgba(250,243,226,1)", marginBottom: 2 }}>
                      {pinnedLetter.recipient_name ? `For ${pinnedLetter.recipient_name}` : pinnedLetter.title}
                    </Text>
                    <Text style={{ fontSize: 11.5, color: "rgba(250,243,226,0.65)" }}>
                      Sealed{pinnedLetter.deliver_at ? ` · opens ${new Date(pinnedLetter.deliver_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: Colors.amber }}>★</Text>
                </View>
                {pinnedLetter.body ? (
                  <Text
                    style={{
                      fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 13,
                      color: "rgba(250,243,226,0.85)", borderLeftWidth: 2,
                      borderLeftColor: Colors.amber, paddingLeft: 10,
                    }}
                    numberOfLines={2}
                  >
                    "{pinnedLetter.body.slice(0, 80)}…"
                  </Text>
                ) : null}
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push("/record" as any)}
                style={({ pressed }) => ({
                  marginHorizontal: 22,
                  marginBottom: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: Colors.rule,
                  borderStyle: "dashed",
                  padding: 16,
                  alignItems: "center",
                  gap: 6,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Feather name="edit-3" size={20} color={Colors.inkMuted} />
                <Text style={{ fontFamily: SERIF, fontSize: 14, color: Colors.inkSoft, textAlign: "center" }}>
                  Create your first Future Letter
                </Text>
                <Text style={{ fontSize: 12, color: Colors.inkMuted }}>A message that opens when they need it most.</Text>
              </Pressable>
            )}

            {/* ── Concierge Status ── */}
            <View
              style={{
                marginHorizontal: 22,
                marginBottom: 16,
                backgroundColor: "rgba(156,175,136,0.14)",
                borderWidth: 1,
                borderColor: "rgba(156,175,136,0.4)",
                borderRadius: 14,
                padding: 10,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Pulsing green dot */}
              <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Animated.View
                  style={{
                    position: "absolute",
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: Colors.sageDeep,
                    transform: [{ scale: pulseScale }],
                    opacity: pulseOpacity,
                  }}
                />
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 4.5,
                    backgroundColor: Colors.sageDeep,
                  }}
                />
              </View>

              {/* Body */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13.5,
                    color: Colors.ink,
                    marginBottom: 1,
                  }}
                >
                  Concierge available now
                </Text>
                <Text style={{ fontSize: 11, color: Colors.inkMuted, lineHeight: 16 }}>
                  Average wait: under 4 minutes · Mon–Sat, 7a–9p PT
                </Text>
              </View>

              {/* CTA */}
              <Pressable
                onPress={() => router.push("/(tabs)/concierge" as any)}
                style={({ pressed }) => ({
                  backgroundColor: Colors.sageDeep,
                  borderRadius: 999,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  minHeight: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.85 : 1,
                  flexShrink: 0,
                })}
              >
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    letterSpacing: 0.4,
                  }}
                >
                  Connect
                </Text>
              </Pressable>
            </View>

            {/* ── Concierge Dashboard section ── */}
            <View style={{ paddingHorizontal: 22 }}>
              <Text
                style={{
                  fontSize: 10,
                  letterSpacing: 2.2,
                  fontWeight: "600",
                  color: Colors.inkMuted,
                  marginBottom: 8,
                  marginTop: 8,
                }}
              >
                Concierge Dashboard
              </Text>

              <View style={{ gap: 6 }}>
                {UTILITY_SUGGESTIONS.map((item) => (
                  <SuggestRow
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    sub={item.sub}
                    onPress={() => router.push(item.route as any)}
                    variant="utility"
                  />
                ))}
              </View>
            </View>

            {/* ── Gentle next steps section ── */}
            <View style={{ paddingHorizontal: 22, marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 10,
                  letterSpacing: 2.2,
                  fontWeight: "600",
                  color: Colors.inkMuted,
                  marginBottom: 8,
                }}
              >
                Gentle next steps
              </Text>

              <View style={{ gap: 6 }}>
                {SOFT_SUGGESTIONS.map((item) => (
                  <SuggestRow
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    sub={item.sub}
                    onPress={() => router.push(item.route as any)}
                    variant="soft"
                  />
                ))}
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
