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
import { Colors } from "../src/constants/colors";
import { useDocuments } from "../src/hooks/useDocuments";
import { useLetters } from "../src/hooks/useLetters";

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

// ── Icon color helper ─────────────────────────────────────────────────────────
function iconColor(status: SectionStatus): string {
  if (status === "done")        return Colors.sageDark;
  if (status === "in-progress") return Colors.amber;
  return Colors.inkMuted;
}

function barColor(status: SectionStatus): string {
  if (status === "done")        return Colors.sageDark;
  if (status === "in-progress") return Colors.amber;
  return "rgba(138,122,102,0.3)";
}

function titleColor(status: SectionStatus): string {
  if (status === "done")        return Colors.inkSoft;
  if (status === "in-progress") return Colors.ink;
  return Colors.inkMuted;
}

export default function Will() {
  const router    = useRouter();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const { data: documents = [] } = useDocuments();
  const { data: letters = [] } = useLetters();

  const hasWill = documents.some((d) => d.category === "will");
  const hasDnr = documents.some((d) => d.category === "dnr");
  const hasFuneral = documents.some((d) => d.category === "funeral_plan");
  const letterCount = letters.length;

  const sections: WillSection[] = [
    {
      status: hasWill ? "done" : "todo",
      icon: hasWill ? "✓" : "○",
      title: "Beneficiaries & Will",
      pct: hasWill ? "100%" : "0%",
      sub: hasWill ? "Document uploaded to vault" : "Upload your will to the vault",
      progress: hasWill ? 100 : 0,
    },
    {
      status: letterCount > 0 ? "done" : "todo",
      icon: letterCount > 0 ? "✓" : "○",
      title: "Letter of Intent",
      pct: letterCount > 0 ? "100%" : "0%",
      sub: letterCount > 0 ? `${letterCount} future letter${letterCount > 1 ? "s" : ""} sealed` : "Write your first future letter",
      progress: letterCount > 0 ? 100 : 0,
    },
    {
      status: hasDnr ? "done" : "todo",
      icon: hasDnr ? "✓" : "○",
      title: "Health Directive",
      pct: hasDnr ? "100%" : "0%",
      sub: hasDnr ? "DNR / advance directive on file" : "Upload your advance directive",
      progress: hasDnr ? 100 : 0,
    },
    {
      status: "todo" as const,
      icon: "○",
      title: "Executor Access",
      pct: "0%",
      sub: "Name a trusted person · they unlock only when needed",
      progress: 0,
    },
    {
      status: hasFuneral ? "done" : "todo",
      icon: hasFuneral ? "✓" : "○",
      title: "Funeral & Final Wishes",
      pct: hasFuneral ? "100%" : "0%",
      sub: hasFuneral ? "Funeral plan on file" : "Upload your funeral plan",
      progress: hasFuneral ? 100 : 0,
    },
  ];

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
            Digital Will
          </Text>

          {/* Step badge */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.4,
              color: Colors.inkMuted,
              minWidth: 60,
              textAlign: "right",
            }}
          >
            {sections.filter(s => s.status === "done").length} of {sections.length} done
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
            LEGALLY NOTARIZED IN 12 STATES
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
              marginBottom: 12,
            }}
          >
            A will{" "}
            <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>
              your family{"\n"}will actually open.
            </Text>
          </Text>

          {/* Sub */}
          <Text
            style={{
              fontSize: 14,
              color: Colors.inkMuted,
              lineHeight: 21,
              marginBottom: 26,
            }}
          >
            Plain English. Notarized. Witnessed. Your executor unlocks it only when needed.
          </Text>

          {/* ── Section list ──────────────────────────────────────────── */}
          {sections.map((section, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: Colors.white,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                shadowColor: Colors.ink,
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
                          ? Colors.sageDark
                          : section.status === "in-progress"
                          ? Colors.amberDeep
                          : Colors.inkMuted,
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
                    color: Colors.inkMuted,
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
              backgroundColor: Colors.parchment,
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
                color: Colors.inkSoft,
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
                color: Colors.inkMuted,
                lineHeight: 20,
              }}
            >
              You'll read every line before signing. Your family will, too — in language they understand, the day they need it.
            </Text>
          </View>

          {/* ── CTA buttons ───────────────────────────────────────────── */}
          {/* Primary: Continue Health Directive */}
          <Pressable
            onPress={() => router.push("/(tabs)/vault" as any)}
            style={({ pressed }) => ({
              backgroundColor: Colors.ink,
              borderRadius: 26,
              paddingVertical: 15,
              alignItems: "center",
              marginBottom: 12,
              opacity: pressed ? 0.82 : 1,
              shadowColor: Colors.ink,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 4,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: "500", color: Colors.parchment, letterSpacing: 0.2 }}>
              Continue Health Directive
            </Text>
          </Pressable>

          {/* Ghost: Talk to Naomi first */}
          <Pressable
            onPress={() => router.push("/(tabs)/concierge" as any)}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: "rgba(74,47,24,0.2)",
              borderRadius: 26,
              paddingVertical: 12,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.inkSoft, letterSpacing: 0.2 }}>
              Talk to Naomi first
            </Text>
          </Pressable>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
