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

// Thumbnail accent colors from prototype data-tone attributes
const THUMB_COLORS = [
  "#9CAF88", // sage
  "#E8A851", // amber
  "#F5EDDF", // cream
  "#3A2D24", // ink
  "#B86241", // terra
];

export default function Archive() {
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
            Story Archive
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
            33 stories
          </Text>
        </View>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 26, paddingBottom: 96 }}
        >
          {/* Display heading */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 24,
              fontWeight: "500",
              color: INK,
              lineHeight: 30,
              letterSpacing: -0.3,
              marginBottom: 22,
            }}
          >
            The family,{"\n"}
            <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>told in their own words.</Text>
          </Text>

          {/* ── Gallery header ─────────────────────────────────────── */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: INK_MUTED, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Gallery
            </Text>
            <Pressable>
              <Text style={{ fontSize: 13, color: AMBER_DEEP, fontWeight: "600" }}>See all ›</Text>
            </Pressable>
          </View>

          {/* ── Hero image ─────────────────────────────────────────── */}
          <View
            style={{
              height: 190,
              borderRadius: 14,
              marginBottom: 10,
              overflow: "hidden",
              backgroundColor: "#D8A868",
            }}
          >
            {/* Amber sky gradient (simulated with layered views) */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 130,
                backgroundColor: "#F3DCB7",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 90,
                backgroundColor: "#8B6039",
                borderTopLeftRadius: 60,
                borderTopRightRadius: 60,
              }}
            />
            {/* Light gleam */}
            <View
              style={{
                position: "absolute",
                top: 90,
                left: 20,
                right: 20,
                height: 22,
                borderRadius: 14,
                backgroundColor: "rgba(255,236,196,0.32)",
              }}
            />
            {/* Hands (simplified ellipses) */}
            <View
              style={{
                position: "absolute",
                top: 100,
                left: 30,
                width: 44,
                height: 20,
                borderRadius: 22,
                backgroundColor: "rgba(201,167,122,0.95)",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 96,
                left: "38%",
                width: 52,
                height: 22,
                borderRadius: 26,
                backgroundColor: "rgba(201,167,122,0.95)",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 102,
                right: 30,
                width: 40,
                height: 20,
                borderRadius: 20,
                backgroundColor: "rgba(201,167,122,0.95)",
              }}
            />
            {/* Letter on table */}
            <View
              style={{
                position: "absolute",
                top: 72,
                left: "42%",
                width: 36,
                height: 24,
                borderRadius: 3,
                backgroundColor: PARCHMENT,
                transform: [{ rotate: "-6deg" }],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 8, color: "#8B6039" }}>
                for Maya
              </Text>
            </View>

            {/* Caption */}
            <View
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: WHITE,
                  fontWeight: "500",
                  backgroundColor: "rgba(45,36,26,0.45)",
                  alignSelf: "flex-start",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                Sunday, May 11 · 6 stories collected
              </Text>
            </View>
          </View>

          {/* ── Thumbnails ─────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 26 }}>
            {THUMB_COLORS.map((color, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 8,
                  backgroundColor: color,
                  borderWidth: color === "#F5EDDF" ? 1 : 0,
                  borderColor: "rgba(74,47,24,0.15)",
                }}
              />
            ))}
          </View>

          {/* ── Narrative storytelling ─────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 0.3,
              color: INK_MUTED,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Narrative storytelling
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: INK_MUTED,
              lineHeight: 19,
              marginBottom: 18,
            }}
          >
            We turn your prompts into games and milestones the whole family plays.
          </Text>

          {/* ── Stats ──────────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 22,
            }}
          >
            {[
              { n: "33",  label: "stories\ncontributed" },
              { n: "7",   label: "voices\nin the choir" },
              { n: "12h", label: "total\noral history" },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.55)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontSize: 22,
                    fontWeight: "600",
                    color: AMBER_DEEP,
                    lineHeight: 26,
                  }}
                >
                  {stat.n}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: INK_MUTED,
                    marginTop: 4,
                    lineHeight: 14,
                    textAlign: "center",
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Family Game card ───────────────────────────────────── */}
          <View
            style={{
              backgroundColor: WHITE,
              borderRadius: 16,
              padding: 18,
              shadowColor: INK,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 1.6,
                color: AMBER_DEEP,
                marginBottom: 8,
              }}
            >
              FAMILY GAME · 8 MIN
            </Text>
            <Text
              style={{
                fontFamily: "Georgia",
                fontStyle: "italic",
                fontSize: 16,
                color: INK,
                lineHeight: 22,
                marginBottom: 6,
              }}
            >
              "Ask Mom: tell me about 1976."
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: INK_SOFT,
                lineHeight: 19,
                marginBottom: 16,
              }}
            >
              A guided five-question prompt set. Everyone plays. Everyone keeps.
            </Text>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: INK,
                borderRadius: 24,
                paddingVertical: 12,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: PARCHMENT, letterSpacing: 0.2 }}>
                Start the round
              </Text>
            </Pressable>
          </View>
        </Animated.ScrollView>

        {/* ── FAB ─────────────────────────────────────────────────────── */}
        <Pressable
          onPress={() => router.push("/record")}
          style={({ pressed }) => ({
            position: "absolute",
            bottom: 32,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: AMBER,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            shadowColor: AMBER_DEEP,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          })}
          accessibilityLabel="Add new story"
        >
          <Text style={{ fontSize: 28, color: WHITE, lineHeight: 32, marginTop: -2 }}>+</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
