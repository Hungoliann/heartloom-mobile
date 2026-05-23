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

// ── Section data from prototype ──────────────────────────────────────────────
type SectionStatus = "done" | "in-progress" | "todo";

interface WillSection {
  status: SectionStatus;
  icon: string;       // prototype text: ✓  ●  ○
  title: string;
  pct: string;
  sub: string;
  progress: number;  // 0–100
}

const SECTIONS: WillSection[] = [
  {
    status: "done",
    icon: "✓",
    title: "Beneficiaries",
    pct: "100%",
    sub: "Maya R. Hayes · Lila M. Hayes · The Hayes Family Trust",
    progress: 100,
  },
  {
    status: "done",
    icon: "✓",
    title: "Letter of Intent",
    pct: "100%",
    sub: "Plain-English wishes for Maya · auto-includes sealed Future Letters",
    progress: 100,
  },
  {
    status: "in-progress",
    icon: "●",
    title: "Health Directive",
    pct: "60%",
    sub: "3 of 5 questions · 4 minutes left · review with Naomi if you like",
    progress: 60,
  },
  {
    status: "todo",
    icon: "○",
    title: "Executor Access",
    pct: "0%",
    sub: "Name 1 trusted person · they unlock only when needed",
    progress: 0,
  },
  {
    status: "todo",
    icon: "○",
    title: "Notary & Witnesses",
    pct: "Ready",
    sub: "e-Notary via Naomi · 2 witnesses on file · 8 min appointment",
    progress: 30,
  },
];

// ── Icon color helper ─────────────────────────────────────────────────────────
function iconColor(status: SectionStatus): string {
  if (status === "done")        return SAGE;
  if (status === "in-progress") return AMBER;
  return INK_MUTED;
}

function barColor(status: SectionStatus): string {
  if (status === "done")        return SAGE;
  if (status === "in-progress") return AMBER;
  return "rgba(138,122,102,0.3)";
}

function titleColor(status: SectionStatus): string {
  if (status === "done")        return INK_SOFT;
  if (status === "in-progress") return INK;
  return INK_MUTED;
}

export default function Will() {
  const router    = useRouter();
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
            Digital Will
          </Text>

          {/* Step badge */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.4,
              color: INK_MUTED,
              minWidth: 60,
              textAlign: "right",
            }}
          >
            3 of 5 done
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
            LEGALLY NOTARIZED IN 12 STATES
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
            A will{" "}
            <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>
              your family{"\n"}will actually open.
            </Text>
          </Text>

          {/* Sub */}
          <Text
            style={{
              fontSize: 14,
              color: INK_MUTED,
              lineHeight: 21,
              marginBottom: 26,
            }}
          >
            Plain English. Notarized. Witnessed. Your executor unlocks it only when needed.
          </Text>

          {/* ── Section list ──────────────────────────────────────────── */}
          {SECTIONS.map((section, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: WHITE,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                shadowColor: INK,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
                opacity: section.status === "done" ? 0.85 : 1,
              }}
            >
              {/* Status icon */}
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  marginTop: 1,
                  backgroundColor:
                    section.status === "done"
                      ? "rgba(74,103,65,0.15)"
                      : section.status === "in-progress"
                      ? "rgba(210,127,20,0.15)"
                      : "rgba(138,122,102,0.12)",
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: section.icon === "✓" ? 13 : 11,
                    fontWeight: "700",
                    color: iconColor(section.status),
                    lineHeight: 16,
                  }}
                >
                  {section.icon}
                </Text>
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                {/* Title row */}
                <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 3 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: titleColor(section.status),
                      flex: 1,
                    }}
                  >
                    {section.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color:
                        section.status === "done"
                          ? SAGE
                          : section.status === "in-progress"
                          ? AMBER_DEEP
                          : INK_MUTED,
                      marginLeft: 8,
                    }}
                  >
                    {section.pct}
                  </Text>
                </View>

                {/* Sub text */}
                <Text
                  style={{
                    fontSize: 12,
                    color: INK_MUTED,
                    lineHeight: 17,
                    marginBottom: 10,
                  }}
                >
                  {section.sub}
                </Text>

                {/* Progress bar */}
                <View
                  style={{
                    height: 4,
                    backgroundColor: "rgba(138,122,102,0.15)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {section.progress > 0 && (
                    <View
                      style={{
                        width: `${section.progress}%`,
                        height: 4,
                        backgroundColor: barColor(section.status),
                        borderRadius: 2,
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* ── Parchment assurance block ─────────────────────────────── */}
          <View
            style={{
              backgroundColor: PARCHMENT,
              borderRadius: 14,
              padding: 18,
              marginTop: 8,
              marginBottom: 22,
              borderWidth: 1,
              borderColor: "rgba(169,95,10,0.14)",
            }}
          >
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 15,
                fontWeight: "600",
                color: INK_SOFT,
                marginBottom: 8,
              }}
            >
              Plain English. No surprises.
            </Text>
            <Text
              style={{
                fontFamily: "Georgia",
                fontStyle: "italic",
                fontSize: 13,
                color: INK_MUTED,
                lineHeight: 20,
              }}
            >
              You'll read every line before signing. Your family will, too — in language they understand, the day they need it.
            </Text>
          </View>

          {/* ── CTA buttons ───────────────────────────────────────────── */}
          {/* Primary: Continue Health Directive */}
          <Pressable
            onPress={() => router.push("/record")}
            style={({ pressed }) => ({
              backgroundColor: INK,
              borderRadius: 26,
              paddingVertical: 15,
              alignItems: "center",
              marginBottom: 12,
              opacity: pressed ? 0.82 : 1,
              shadowColor: INK,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 4,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: "500", color: PARCHMENT, letterSpacing: 0.2 }}>
              Continue Health Directive
            </Text>
          </Pressable>

          {/* Ghost: Talk to Naomi first */}
          <Pressable
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: "rgba(74,47,24,0.2)",
              borderRadius: 26,
              paddingVertical: 12,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: "500", color: INK_SOFT, letterSpacing: 0.2 }}>
              Talk to Naomi first
            </Text>
          </Pressable>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
