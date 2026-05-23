import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ── Colors ──────────────────────────────────────────────────────────────────
const BG         = "#F5EDDF";
const INK        = "#2D241A";
const INK_SOFT   = "#4A3D2E";
const INK_MUTED  = "#8A7A66";
const AMBER      = "#D27F14";
const AMBER_DEEP = "#B06600";
const SAGE       = "#4A6741";
const WHITE      = "#FFFFFF";
const PARCHMENT  = "#FBF2DD";

// ── Bar chart data ────────────────────────────────────────────────────────────
const BARS = [
  { pct: 38, accent: false },
  { pct: 52, accent: false },
  { pct: 24, accent: false },
  { pct: 60, accent: false },
  { pct: 46, accent: false },
  { pct: 78, accent: true  },
  { pct: 88, accent: true  },
  { pct: 96, accent: true  },
];
const BAR_H = 80; // container height in px

// ── Trigger rows ─────────────────────────────────────────────────────────────
const TRIGGERS = [
  {
    month: "JUN",
    day: "14",
    title: "Maya's 30th birthday",
    sub: "2 letters waiting · suggest: childhood photo · 5 min",
    soft: false,
  },
  {
    month: "AUG",
    day: "22",
    title: "Anniversary · 31 years",
    sub: "Suggest: how you met, in 90 seconds · voice",
    soft: false,
  },
  {
    month: "SEP",
    day: "09",
    title: "College send-off · Maya",
    sub: "Suggest: the apartment recipe · 1 page · letter",
    soft: false,
  },
  {
    month: "OCT",
    day: "—",
    title: "A quieter month",
    sub: "Rest is part of the record, too.",
    soft: true,
  },
];

export default function Planner() {
  const router = useRouter();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(74,47,24,0.14)",
            backgroundColor: BG,
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
              borderColor: "rgba(74,47,24,0.14)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.65 : 1,
            })}
            accessibilityLabel="Back to Home"
          >
            <Text style={{ fontSize: 20, color: INK_SOFT, lineHeight: 24, marginTop: -1 }}>‹</Text>
          </Pressable>

          {/* Title */}
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 14,
              color: INK_SOFT,
            }}
          >
            Planner
          </Text>

          {/* Step badge */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              color: INK_MUTED,
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
              color: INK_MUTED,
              marginBottom: 8,
            }}
          >
            OPPORTUNITIES
          </Text>

          {/* Display heading */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 24,
              fontWeight: "500",
              color: INK,
              lineHeight: 30,
              letterSpacing: -0.3,
              marginBottom: 12,
            }}
          >
            to say{" "}
            <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>I love you,</Text>
            {"\n"}before life asks for it.
          </Text>

          {/* Sub */}
          <Text
            style={{
              fontSize: 14,
              color: INK_MUTED,
              lineHeight: 21,
              marginBottom: 24,
            }}
          >
            A proactive dashboard of moments coming up in your family's life. Each one is a chance to seal a letter, a voice, a recipe.
          </Text>

          {/* ── Chart Card ──────────────────────────────────────────── */}
          <View
            style={{
              backgroundColor: WHITE,
              borderRadius: 16,
              padding: 16,
              marginBottom: 28,
              shadowColor: INK,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Chart head */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: INK, letterSpacing: 0.2 }}>
                Letters sealed · last 8 weeks
              </Text>
              <Text style={{ fontSize: 14, color: INK_MUTED }}>›</Text>
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
              {BARS.map((bar, i) => (
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
                      backgroundColor: bar.accent ? AMBER : "rgba(210,127,20,0.3)",
                      borderRadius: 3,
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Axis */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10, paddingHorizontal: 2 }}>
              <Text style={{ fontSize: 9, color: INK_MUTED, fontWeight: "600", letterSpacing: 0.5 }}>MAR</Text>
              <Text style={{ fontSize: 9, color: INK_MUTED, fontWeight: "600", letterSpacing: 0.5 }}>APR</Text>
              <Text style={{ fontSize: 9, color: INK_MUTED, fontWeight: "600", letterSpacing: 0.5 }}>MAY</Text>
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
                <Text style={{ fontSize: 11, fontWeight: "700", color: SAGE }}>↑ 3× this month</Text>
              </View>
              <Text style={{ fontSize: 12, color: INK_SOFT }}>Mom's birthday is coming up.</Text>
            </View>
          </View>

          {/* ── Section title ─────────────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 0.3,
              color: INK_MUTED,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            This season's openings
          </Text>

          {/* ── Trigger rows ──────────────────────────────────────── */}
          {TRIGGERS.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: WHITE,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                opacity: item.soft ? 0.6 : 1,
                shadowColor: INK,
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
                    color: item.soft ? INK_MUTED : AMBER_DEEP,
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
                    color: item.soft ? INK_MUTED : INK,
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
                    color: item.soft ? INK_MUTED : INK,
                    marginBottom: 3,
                    lineHeight: 19,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: INK_MUTED,
                    lineHeight: 17,
                  }}
                >
                  {item.sub}
                </Text>
              </View>

              {/* Begin button (only for non-soft rows) */}
              {!item.soft && (
                <Pressable
                  onPress={() => router.push("/record")}
                  style={({ pressed }) => ({
                    backgroundColor: INK,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    marginLeft: 10,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: PARCHMENT, letterSpacing: 0.2 }}>
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
