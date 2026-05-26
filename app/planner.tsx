import { Pressable } from "../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../src/constants/fonts";
import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../src/constants/colors";
import { useLetters } from "../src/hooks/useLetters";

const BAR_H = 80; // container height in px

export default function Planner() {
  const router = useRouter();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const { data: letters = [] } = useLetters();

  const weeklyBars = useMemo(() => {
    // Build 8-week letter counts (most recent week last)
    const counts = Array(8).fill(0);
    const now = new Date();
    for (const letter of letters) {
      const created = new Date(letter.created_at!);
      const weeksAgo = Math.floor((now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo < 8) counts[7 - weeksAgo]++;
    }
    const max = Math.max(...counts, 1);
    return counts.map((c, i) => ({
      pct: Math.round((c / max) * 100) || 8, // minimum 8% so bar is visible
      accent: i >= 5, // last 3 weeks are "accent" colored
    }));
  }, [letters]);

  const thisMonthCount = letters.filter((l) => {
    const d = new Date(l.created_at!);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const deltaText = thisMonthCount > 0
    ? `${thisMonthCount} letter${thisMonthCount > 1 ? "s" : ""} this month`
    : "No letters yet this month";

  const upcomingTriggers = useMemo(() => {
    const triggers = letters
      .filter((l) => l.deliver_at && !l.delivered_at && new Date(l.deliver_at) > new Date())
      .sort((a, b) => new Date(a.deliver_at!).getTime() - new Date(b.deliver_at!).getTime())
      .slice(0, 3)
      .map((l) => {
        const d = new Date(l.deliver_at!);
        return {
          month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
          day: String(d.getDate()),
          title: l.title,
          sub: l.recipient_name ? `For ${l.recipient_name} · sealed letter` : "Sealed letter",
          soft: false,
        };
      });
    if (triggers.length === 0) {
      triggers.push({
        month: "—",
        day: "—",
        title: "No upcoming deliveries",
        sub: "Write a future letter to create one.",
        soft: true,
      });
    }
    return triggers;
  }, [letters]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: Colors.rule,
            backgroundColor: Colors.bg,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: Colors.rule,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.65 : 1,
            })}
            accessibilityLabel="Back to Home"
          >
            <Text style={{ fontSize: 20, color: Colors.inkSoft, lineHeight: 24, marginTop: -1 }}>‹</Text>
          </Pressable>

          {/* Title */}
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: SERIF_ITALIC,
              fontStyle: "italic",
              fontSize: 14,
              color: Colors.inkSoft,
            }}
          >
            Planner
          </Text>

          {/* Step badge */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              color: Colors.inkMuted,
              minWidth: 60,
              textAlign: "right",
            }}
          >
            Next 12 mo
          </Text>
        </View>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 26, paddingBottom: 48 }}
        >
          {/* Eyebrow */}
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.8,
              color: Colors.inkMuted,
              marginBottom: 8,
            }}
          >
            OPPORTUNITIES
          </Text>

          {/* Display heading */}
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: "500",
              color: Colors.ink,
              lineHeight: 30,
              letterSpacing: -0.3,
              marginBottom: 12,
            }}
          >
            to say{" "}
            <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>I love you,</Text>
            {"\n"}before life asks for it.
          </Text>

          {/* Sub */}
          <Text
            style={{
              fontSize: 14,
              color: Colors.inkMuted,
              lineHeight: 21,
              marginBottom: 24,
            }}
          >
            A proactive dashboard of moments coming up in your family's life. Each one is a chance to seal a letter, a voice, a recipe.
          </Text>

          {/* ── Chart Card ──────────────────────────────────────────── */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 16,
              marginBottom: 28,
              shadowColor: Colors.ink,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Chart head */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.ink, letterSpacing: 0.2 }}>
                Letters sealed · last 8 weeks
              </Text>
              <Text style={{ fontSize: 14, color: Colors.inkMuted }}>›</Text>
            </View>

            {/* Bars */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                height: BAR_H,
                gap: 5,
                marginBottom: 8,
              }}
            >
              {weeklyBars.map((bar, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: BAR_H,
                    justifyContent: "flex-end",
                  }}
                >
                  <View
                    style={{
                      height: (bar.pct / 100) * BAR_H,
                      backgroundColor: bar.accent ? Colors.amber : "rgba(210,127,20,0.3)",
                      borderRadius: 3,
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Axis */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10, paddingHorizontal: 2 }}>
              <Text style={{ fontSize: 9, color: Colors.inkMuted, fontWeight: "600", letterSpacing: 0.5 }}>MAR</Text>
              <Text style={{ fontSize: 9, color: Colors.inkMuted, fontWeight: "600", letterSpacing: 0.5 }}>APR</Text>
              <Text style={{ fontSize: 9, color: Colors.inkMuted, fontWeight: "600", letterSpacing: 0.5 }}>MAY</Text>
            </View>

            {/* Delta pill + text */}
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <View
                style={{
                  backgroundColor: "rgba(74,103,65,0.15)",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.sageDark }}>{deltaText}</Text>
              </View>
            </View>
          </View>

          {/* ── Section title ─────────────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 0.3,
              color: Colors.inkMuted,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            This season's openings
          </Text>

          {/* ── Trigger rows ──────────────────────────────────────── */}
          {upcomingTriggers.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                opacity: item.soft ? 0.6 : 1,
                shadowColor: Colors.ink,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: item.soft ? 0.04 : 0.07,
                shadowRadius: 6,
                elevation: item.soft ? 1 : 2,
              }}
            >
              {/* Date badge */}
              <View
                style={{
                  width: 46,
                  alignItems: "center",
                  marginRight: 14,
                  backgroundColor: item.soft ? "rgba(138,122,102,0.12)" : "rgba(210,127,20,0.1)",
                  borderRadius: 8,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "700",
                    color: item.soft ? Colors.inkMuted : Colors.amberDeep,
                    letterSpacing: 0.8,
                    lineHeight: 13,
                  }}
                >
                  {item.month}
                </Text>
                <Text
                  style={{
                    fontSize: item.day === "—" ? 16 : 18,
                    fontWeight: "700",
                    color: item.soft ? Colors.inkMuted : Colors.ink,
                    lineHeight: 22,
                  }}
                >
                  {item.day}
                </Text>
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: item.soft ? Colors.inkMuted : Colors.ink,
                    marginBottom: 3,
                    lineHeight: 19,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.inkMuted,
                    lineHeight: 17,
                  }}
                >
                  {item.sub}
                </Text>
              </View>

              {/* Begin button (only for non-soft rows) */}
              {!item.soft && (
                <Pressable
                  onPress={() => router.push("/record" as any)}
                  style={({ pressed }) => ({
                    backgroundColor: Colors.ink,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    marginLeft: 10,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.parchment, letterSpacing: 0.2 }}>
                    Begin
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
