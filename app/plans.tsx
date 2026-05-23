import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ── Brand tokens (matching prototype.css) ──────────────────────────────────
const CREAM = "#FAF3E2";
const PAPER = "#FBF4DC";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTE = "#8A7A66";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const RULE = "rgba(74,47,24,0.14)";

type PlanId = "gift" | "vault" | "family";

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  priceNote: string;
  trialLine: string;
  body: string;
  badge?: string;
  anchor?: boolean;
  features: string[];
}[] = [
  {
    id: "gift",
    name: "Gift Letter",
    price: "$49",
    priceNote: "once",
    trialLine: "3-day free preview · charged after",
    body: "Send one Future Letter to a parent or grandparent. Mailed certificate included.",
    features: [
      "One sealed letter",
      "Letterpress certificate",
      "Recipient onboarding",
    ],
  },
  {
    id: "vault",
    name: "Legacy Vault",
    price: "$299",
    priceNote: "one time",
    trialLine: "Start with 3 days free · then $299 once",
    body: "A permanent home for every letter, will, directive, and executor instruction you'll ever make.",
    badge: "Most chosen",
    anchor: true,
    features: [
      "Unlimited letters & recordings",
      "Digital Will & Advance Directive",
      "Executor access & key escrow",
      "Bronze Delivery Hallmark",
    ],
  },
  {
    id: "family",
    name: "Family Concierge",
    price: "$15",
    priceNote: "/ month",
    trialLine: "3 days free · then $15/month · cancel anytime",
    body: "Active human support through the seasons that matter — Medicare, hospice, estate logistics, family coordination.",
    features: [
      "Everything in Legacy Vault",
      "Medicare benefit optimization",
      "Hospice benefits review",
      "Estate executor coordination",
    ],
  },
];

export default function PlansScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<PlanId>("vault");

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: RULE,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: RULE,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? "rgba(210,127,20,0.08)" : "transparent",
            })}
            accessibilityLabel="Back"
          >
            <Text style={{ fontSize: 18, color: INK_SOFT, lineHeight: 22 }}>‹</Text>
          </Pressable>

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
            A few honest options
          </Text>

          {/* Spacer */}
          <View style={{ width: 48 }} />
        </View>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 22, paddingBottom: 40, gap: 16 }}
        >
          {/* Eyebrow */}
          <Text
            style={{
              fontSize: 10.5,
              fontWeight: "600",
              letterSpacing: 2.0,
              color: AMBER_DEEP,
              textTransform: "uppercase",
              marginBottom: -8,
            }}
          >
            WE ONLY ASK FOR MORE WHEN LIFE DOES
          </Text>

          {/* Heading */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 24,
              fontWeight: "500",
              lineHeight: 29,
              letterSpacing: -0.3,
              color: INK,
              marginBottom: 4,
            }}
          >
            Today's heirloom is{" "}
            <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>free.</Text>
            {" "}Here is what comes next.
          </Text>

          {/* ── Trial banner ──────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(210,127,20,0.25)",
              backgroundColor: "rgba(210,127,20,0.07)",
            }}
          >
            <Text style={{ fontSize: 12, color: AMBER_DEEP, marginTop: 1 }}>✦</Text>
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: INK_SOFT,
                lineHeight: 19,
              }}
            >
              <Text style={{ fontWeight: "600" }}>3 days free</Text> on any plan, for new families. Cancel anytime — your heirloom stays.
            </Text>
          </View>

          {/* ── Plan cards ────────────────────────────────────────────── */}
          <View style={{ gap: 10 }}>
            {PLANS.map((plan) => {
              const isSelected = selected === plan.id;
              const isAnchor = !!plan.anchor;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelected(plan.id)}
                  style={({ pressed }) => ({
                    position: "relative",
                    borderRadius: 14,
                    borderWidth: isSelected && isAnchor ? 1 : 1,
                    borderColor: isSelected && isAnchor
                      ? AMBER
                      : isSelected
                      ? INK
                      : RULE,
                    backgroundColor: isAnchor ? INK : PAPER,
                    padding: 14,
                    paddingBottom: 12,
                    opacity: pressed ? 0.94 : 1,
                    // Double border for selected anchor plan
                    ...(isSelected && isAnchor
                      ? {
                          shadowColor: AMBER,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.35,
                          shadowRadius: 0,
                          elevation: 0,
                        }
                      : isSelected
                      ? {
                          shadowColor: INK,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.25,
                          shadowRadius: 0,
                          elevation: 0,
                        }
                      : {}),
                  })}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <View
                      style={{
                        position: "absolute",
                        top: -9,
                        right: 14,
                        backgroundColor: AMBER,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: "#FFFFFF",
                        }}
                      >
                        {plan.badge}
                      </Text>
                    </View>
                  )}

                  {/* Plan head row */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Georgia",
                        fontSize: 17,
                        fontWeight: "500",
                        color: isAnchor ? CREAM : INK,
                        flex: 1,
                      }}
                    >
                      {plan.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "baseline",
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Georgia",
                          fontSize: 22,
                          fontWeight: "500",
                          color: isAnchor ? CREAM : INK,
                        }}
                      >
                        {plan.price}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          fontWeight: "500",
                          letterSpacing: 0.4,
                          color: isAnchor
                            ? "rgba(250,243,226,0.60)"
                            : INK_MUTE,
                          textTransform: "lowercase",
                        }}
                      >
                        {plan.priceNote}
                      </Text>
                    </View>
                  </View>

                  {/* Trial line */}
                  <Text
                    style={{
                      fontSize: isAnchor ? 12 : 11.5,
                      color: isAnchor ? AMBER : INK_MUTE,
                      marginBottom: 8,
                      lineHeight: 16,
                    }}
                  >
                    {plan.trialLine}
                  </Text>

                  {/* Body description */}
                  <Text
                    style={{
                      fontSize: 12.5,
                      lineHeight: 18,
                      color: isAnchor ? "rgba(250,243,226,0.84)" : INK_SOFT,
                      marginBottom: 8,
                    }}
                  >
                    {plan.body}
                  </Text>

                  {/* Features list */}
                  <View style={{ gap: 4 }}>
                    {plan.features.map((feat) => (
                      <View
                        key={feat}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 6,
                        }}
                      >
                        {/* Checkmark bullet */}
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: isAnchor ? AMBER : AMBER_DEEP,
                            lineHeight: 17,
                            width: 14,
                          }}
                        >
                          ✓
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            lineHeight: 17,
                            color: isAnchor
                              ? "rgba(250,243,226,0.78)"
                              : INK_MUTE,
                            flex: 1,
                          }}
                        >
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Footer note */}
          <Text
            style={{
              textAlign: "center",
              fontSize: 11.5,
              color: INK_MUTE,
              lineHeight: 17,
              marginTop: 4,
            }}
          >
            No charge today. We'll remind you the day before your trial ends.{" "}
            <Text style={{ fontStyle: "italic" }}>
              Skip and your heirloom stays free, forever.
            </Text>
          </Text>

          {/* ── CTAs ──────────────────────────────────────────────────── */}
          <View style={{ gap: 6, marginTop: 6 }}>
            {/* Primary */}
            <Pressable
              onPress={() => router.push("/(auth)/sign-up" as any)}
              style={({ pressed }) => ({
                width: "100%",
                minHeight: 50,
                borderRadius: 26,
                backgroundColor: INK,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 13,
                paddingHorizontal: 22,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                  color: CREAM,
                }}
              >
                Start 3-day free trial
              </Text>
            </Pressable>

            {/* Ghost / skip */}
            <Pressable
              onPress={() => router.replace("/(tabs)" as any)}
              style={({ pressed }) => ({
                width: "100%",
                minHeight: 42,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: RULE,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 9,
                paddingHorizontal: 22,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: INK,
                }}
              >
                Skip for now
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
