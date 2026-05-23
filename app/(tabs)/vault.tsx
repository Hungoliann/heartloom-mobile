import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

// ── Brand tokens (matching prototype.css) ──────────────────────────────────
const CREAM = "#FAF3E2";
const PAPER = "#FBF4DC";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTE = "#8A7A66";
const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const RULE = "rgba(74,47,24,0.14)";

// ── Vault node data ─────────────────────────────────────────────────────────
const NODES = [
  {
    id: "letter",
    icon: "✉",
    label: "Future Letter",
    sub: "For Maya · sealed",
    filled: true,
  },
  {
    id: "will",
    icon: "§",
    label: "Digital Will",
    sub: "Add when ready",
    filled: false,
  },
  {
    id: "directive",
    icon: "✤",
    label: "Advance Directive",
    sub: "Hospice-ready",
    filled: false,
  },
  {
    id: "executor",
    icon: "⚶",
    label: "Executor Access",
    sub: "Name a trusted person",
    filled: false,
  },
];

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
              color: AMBER_DEEP,
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
              color: INK,
            }}
          >
            Where your letter{" "}
            <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>
              actually lives.
            </Text>
          </Text>

          {/* ── Vault grid ────────────────────────────────────────────── */}
          <View
            style={{
              borderWidth: 1,
              borderColor: RULE,
              borderRadius: 16,
              padding: 14,
              backgroundColor: PAPER,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {NODES.map((node) => (
                <View
                  key={node.id}
                  style={{
                    width: "47.5%",
                    minHeight: 84,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderStyle: node.filled ? "solid" : "dashed",
                    borderColor: node.filled ? INK : "rgba(74,47,24,0.25)",
                    backgroundColor: node.filled ? INK : "rgba(255,251,243,0.45)",
                    padding: 12,
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: node.filled ? AMBER : AMBER_DEEP,
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
                      color: node.filled ? CREAM : INK,
                      lineHeight: 17,
                    }}
                  >
                    {node.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: node.filled ? "rgba(250,243,226,0.70)" : INK_MUTE,
                      lineHeight: 15,
                    }}
                  >
                    {node.sub}
                  </Text>
                </View>
              ))}
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
                  color: INK,
                  fontWeight: "500",
                  lineHeight: 17,
                }}
              >
                Bronze Delivery Hallmark
              </Text>
              <Text
                style={{
                  fontSize: 11.5,
                  color: INK_MUTE,
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
              color: INK_SOFT,
              marginTop: 6,
              marginBottom: 4,
            }}
          >
            Bank-grade encryption. Heirloom-grade tactility.
          </Text>

          {/* ── Continue button ───────────────────────────────────────── */}
          <Pressable
            onPress={() => router.push("/done" as any)}
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
              marginTop: 4,
            })}
          >
            <Text
              style={{
                fontFamily: "System",
                fontSize: 15,
                fontWeight: "500",
                color: CREAM,
              }}
            >
              Continue
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
