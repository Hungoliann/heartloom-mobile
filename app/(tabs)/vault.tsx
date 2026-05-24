import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { Colors } from "../../src/constants/colors";
import { useLetters } from "../../src/hooks/useLetters";
import { useDocuments } from "../../src/hooks/useDocuments";


// ── Hallmark coin SVG ────────────────────────────────────────────────────────
function HallmarkCoin() {
  return (
    <Svg width={64} height={64} viewBox="0 0 120 120" fill="none">
      <Circle cx={60} cy={60} r={56} stroke="#8B6039" strokeWidth={1.5} />
      <Circle
        cx={60}
        cy={60}
        r={48}
        stroke="#8B6039"
        strokeWidth={0.8}
        strokeDasharray="2 4"
        opacity={0.55}
      />
      <Path
        d="M40 66c5 5 10 5 20 0 10-5 15-5 20 0"
        stroke="#8B6039"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <SvgText
        x={60}
        y={52}
        textAnchor="middle"
        fontFamily="Georgia"
        fontSize={12}
        fontStyle="italic"
        fill="#8B6039"
        letterSpacing={1.5}
      >
        HEARTLOOM
      </SvgText>
      <SvgText
        x={60}
        y={84}
        textAnchor="middle"
        fontFamily="System"
        fontSize={6.5}
        fill="#8B6039"
        letterSpacing={2.5}
      >
        DELIVERED
      </SvgText>
    </Svg>
  );
}

export default function VaultScreen() {
  const router = useRouter();

  // ── Live data ──────────────────────────────────────────────────────────────
  const { data: letters = [] } = useLetters();
  const { data: willDocs = [] } = useDocuments("will");
  const { data: dnrDocs = [] } = useDocuments("dnr");
  const { data: financialDocs = [] } = useDocuments("financial");

  // ── Dynamic nodes ──────────────────────────────────────────────────────────
  const nodes = [
    {
      id: "letter",
      icon: "✉",
      label: "Future Letters",
      filled: letters.length > 0,
      sub:
        letters.length > 0
          ? `${letters.length} letter${letters.length > 1 ? "s" : ""} · sealed`
          : "Write your first",
      route: "/record" as const,
    },
    {
      id: "will",
      icon: "§",
      label: "Digital Will",
      filled: willDocs.length > 0,
      sub: willDocs.length > 0 ? "On file" : "Add when ready",
      route: "/will" as const,
    },
    {
      id: "directive",
      icon: "✤",
      label: "Advance Directive",
      filled: dnrDocs.length > 0,
      sub: dnrDocs.length > 0 ? "On file" : "Hospice-ready",
      route: "/will" as const,
    },
    {
      id: "executor",
      icon: "⚶",
      label: "Executor Access",
      filled: financialDocs.length > 0,
      sub: financialDocs.length > 0 ? "On file" : "Name a trusted person",
      route: "/will" as const,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
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
            borderBottomColor: Colors.rule,
          }}
        >
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
              backgroundColor: pressed ? "rgba(210,127,20,0.08)" : "transparent",
            })}
            accessibilityLabel="Back"
          >
            <Text style={{ fontSize: 18, color: Colors.inkSoft, lineHeight: 22 }}>‹</Text>
          </Pressable>

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
            Your Vault
          </Text>

          {/* Spacer to balance the back button */}
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
              fontFamily: "System",
              fontSize: 10.5,
              fontWeight: "600",
              letterSpacing: 2.2,
              color: Colors.amberDeep,
              textTransform: "uppercase",
              marginBottom: -8,
            }}
          >
            A DIGITAL SAFETY DEPOSIT BOX
          </Text>

          {/* Display heading */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 26,
              fontWeight: "500",
              lineHeight: 31,
              letterSpacing: -0.3,
              color: Colors.ink,
            }}
          >
            Where your letter{" "}
            <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>
              actually lives.
            </Text>
          </Text>

          {/* ── Vault grid ────────────────────────────────────────────── */}
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.rule,
              borderRadius: 16,
              padding: 14,
              backgroundColor: Colors.paper,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {nodes.map((node) => {
                const cardStyle = {
                  width: "47.5%" as const,
                  minHeight: 84,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderStyle: (node.filled ? "solid" : "dashed") as "solid" | "dashed",
                  borderColor: node.filled ? Colors.ink : "rgba(74,47,24,0.25)",
                  backgroundColor: node.filled ? Colors.ink : "rgba(255,251,243,0.45)",
                  padding: 12,
                  gap: 4,
                };

                if (node.filled) {
                  return (
                    <View key={node.id} style={cardStyle}>
                      <Text
                        style={{
                          fontSize: 18,
                          color: Colors.amber,
                          lineHeight: 22,
                        }}
                      >
                        {node.icon}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Georgia",
                          fontSize: 13.5,
                          fontWeight: "500",
                          color: Colors.cream,
                          lineHeight: 17,
                        }}
                      >
                        {node.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "rgba(250,243,226,0.70)",
                          lineHeight: 15,
                        }}
                      >
                        {node.sub}
                      </Text>
                    </View>
                  );
                }

                return (
                  <Pressable
                    key={node.id}
                    onPress={() => router.push(node.route as any)}
                    style={({ pressed }) => ({
                      ...cardStyle,
                      opacity: pressed ? 0.75 : 1,
                    })}
                    accessibilityLabel={`Add ${node.label}`}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: Colors.amberDeep,
                        lineHeight: 22,
                      }}
                    >
                      {node.icon}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Georgia",
                        fontSize: 13.5,
                        fontWeight: "500",
                        color: Colors.ink,
                        lineHeight: 17,
                      }}
                    >
                      {node.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: Colors.inkMuted,
                        lineHeight: 15,
                      }}
                    >
                      {node.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Bronze Delivery Hallmark ──────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "rgba(139,96,57,0.35)",
              borderRadius: 14,
              backgroundColor: "rgba(201,167,122,0.10)",
              marginTop: 4,
            }}
          >
            {/* Coin */}
            <View
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
              }}
            >
              <HallmarkCoin />
            </View>

            {/* Body */}
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontSize: 13.5,
                  color: Colors.ink,
                  fontWeight: "500",
                  lineHeight: 17,
                }}
              >
                Bronze Delivery Hallmark
              </Text>
              <Text
                style={{
                  fontSize: 11.5,
                  color: Colors.inkMuted,
                  lineHeight: 16,
                }}
              >
                Pressed into the seal when the letter reaches them. Provable, dateable, irreversible.
              </Text>
            </View>
          </View>

          {/* Footer line */}
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 12,
              color: Colors.inkSoft,
              marginTop: 6,
              marginBottom: 4,
            }}
          >
            Bank-grade encryption. Heirloom-grade tactility.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
