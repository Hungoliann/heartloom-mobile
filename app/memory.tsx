import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../src/constants/colors";

// ── Waveform bars from prototype SVG ─────────────────────────────────────────
// Two groups: played (amber) vs unplayed (dim brown)
// Each entry: x position in original 320-wide SVG → relative width bar heights
const WAVE_PLAYED = [
  12, 20, 32, 16, 40, 24, 48, 32, 20, 56, 36, 16, 32, 44, 20, 52,
];
const WAVE_UNPLAYED = [
  24, 32, 16, 40, 20, 48, 24, 32, 16, 36, 20, 44, 32, 16, 24, 32,
  20, 32, 16, 48, 24, 20, 32, 16, 40, 20, 32, 16, 24, 32, 20, 32, 32,
];
// Playhead at 30% through the track
const PLAYHEAD_PCT = 0.3;

// ── Voice list ────────────────────────────────────────────────────────────────
const VOICES = [
  {
    initials: "EH",
    bgColor: Colors.amber,
    name: "Eleanor",
    detail: "4 recordings · 38 min",
    last: "the sound of the screen door",
  },
  {
    initials: "JH",
    bgColor: Colors.sageDark,
    name: "James",
    detail: "6 recordings · 1h 12 min",
    last: "how I asked your mother to marry me",
  },
  {
    initials: "LM",
    bgColor: Colors.bg,
    name: "Lila (Mom)",
    detail: "11 recordings · 3h 04 min",
    last: "1976, the summer of the brown station wagon",
  },
  {
    initials: "MR",
    bgColor: "#3A2D24",
    name: "Maya",
    detail: "2 recordings · 18 min",
    last: "what I want to remember about right now",
  },
];

export default function MemoryScreen() {
  const router  = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

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
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 14,
              color: Colors.inkSoft,
            }}
          >
            Audio Legacy
          </Text>

          {/* Step badge */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.4,
              color: Colors.inkMuted,
              minWidth: 68,
              textAlign: "right",
            }}
          >
            12h · 7 voices
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
            ORAL HISTORY
          </Text>

          {/* Display heading */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 24,
              fontWeight: "500",
              color: Colors.ink,
              lineHeight: 30,
              letterSpacing: -0.3,
              marginBottom: 22,
            }}
          >
            Their voice.{"\n"}
            <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>Pressed into time.</Text>
          </Text>

          {/* ── Audio player card ───────────────────────────────────── */}
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
            {/* Card head: avatar + title */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: Colors.amber,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.white }}>EH</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontStyle: "italic",
                    fontSize: 14,
                    color: Colors.ink,
                    lineHeight: 19,
                    marginBottom: 2,
                  }}
                >
                  "the sound of the screen door"
                </Text>
                <Text style={{ fontSize: 11, color: Colors.inkMuted }}>
                  Eleanor M. Hayes · May 13, 2026 · 1:42
                </Text>
              </View>
            </View>

            {/* Waveform */}
            <View
              style={{
                height: 60,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                position: "relative",
              }}
            >
              {/* Played portion */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  width: `${PLAYHEAD_PCT * 100}%`,
                  height: 60,
                }}
              >
                {WAVE_PLAYED.map((h, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: (h / 60) * 56,
                      backgroundColor: Colors.amber,
                      borderRadius: 2,
                      opacity: 0.95,
                    }}
                  />
                ))}
              </View>

              {/* Playhead line */}
              <View
                style={{
                  width: 2,
                  height: 60,
                  backgroundColor: Colors.amberDeep,
                  marginHorizontal: 1,
                }}
              />

              {/* Unplayed portion */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  height: 60,
                }}
              >
                {WAVE_UNPLAYED.map((h, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: (h / 60) * 56,
                      backgroundColor: Colors.amberDim,
                      borderRadius: 2,
                      opacity: 0.55,
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Controls row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              {/* Play button */}
              <Pressable
                onPress={() => setIsPlaying((p) => !p)}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: Colors.ink,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
                accessibilityLabel={isPlaying ? "Pause" : "Play"}
              >
                <Text style={{ fontSize: 16, color: Colors.white, marginLeft: isPlaying ? 0 : 2 }}>
                  {isPlaying ? "⏸" : "▶"}
                </Text>
              </Pressable>

              {/* Time */}
              <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.inkSoft, letterSpacing: 0.5 }}>
                <Text style={{ color: Colors.amberDeep }}>0:32</Text>
                <Text style={{ color: Colors.inkMuted }}> / 1:42</Text>
              </Text>

              {/* Speed button */}
              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: "rgba(74,47,24,0.08)",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityLabel="Playback speed"
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.inkSoft }}>1.0×</Text>
              </Pressable>
            </View>

            {/* Transcript */}
            <View
              style={{
                backgroundColor: Colors.parchment,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: Colors.inkSoft,
                  lineHeight: 20,
                  marginBottom: 8,
                }}
              >
                "…and the screen door — that screen door — would{" "}
                <Text style={{ backgroundColor: "rgba(210,127,20,0.25)", color: Colors.amberDeep }}>slap</Text>
                {" "}twice, never once, and we'd know exactly who was home. My mother's slap was slow. Mine was a hurry. Yours, Maya — yours was the laughing kind. I want you to remember that sound when nothing else makes sense…"
              </Text>
              <Text style={{ fontSize: 10.5, color: Colors.inkMuted }}>Auto-transcribed · edit ›</Text>
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
            Voices in the family choir
          </Text>

          {/* ── Voice list ────────────────────────────────────────── */}
          {VOICES.map((voice, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 13,
                borderBottomWidth: i < VOICES.length - 1 ? 1 : 0,
                borderBottomColor: "rgba(74,47,24,0.08)",
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: voice.bgColor,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: voice.bgColor === Colors.bg ? 1 : 0,
                  borderColor: "rgba(74,47,24,0.2)",
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: voice.bgColor === Colors.bg ? Colors.inkSoft : Colors.white,
                  }}
                >
                  {voice.initials}
                </Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.ink, marginBottom: 2 }}>
                  {voice.name} · {voice.detail}
                </Text>
                <Text style={{ fontSize: 11.5, color: Colors.inkMuted }} numberOfLines={1}>
                  Last: "{voice.last}"
                </Text>
              </View>
            </View>
          ))}

          {/* ── CTA button ────────────────────────────────────────── */}
          <Pressable
            onPress={() => router.push("/record")}
            style={({ pressed }) => ({
              backgroundColor: Colors.ink,
              borderRadius: 26,
              paddingVertical: 15,
              alignItems: "center",
              marginTop: 24,
              opacity: pressed ? 0.82 : 1,
              shadowColor: Colors.ink,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 4,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: "500", color: Colors.parchment, letterSpacing: 0.2 }}>
              Record a new memory
            </Text>
          </Pressable>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
