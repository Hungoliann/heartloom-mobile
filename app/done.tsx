import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { Colors } from "../src/constants/colors";

// ── Bloom SVG ─────────────────────────────────────────────────────────────────
function BloomArt() {
  return (
    <Svg width={150} height={150} viewBox="0 0 200 200" fill="none">
      <Circle
        cx={100}
        cy={100}
        r={86}
        stroke={Colors.sageDeep}
        strokeWidth={1}
        strokeDasharray="2 8"
        opacity={0.35}
      />
      <Circle cx={100} cy={100} r={60} fill={Colors.sageDeep} opacity={0.08} />
      <Circle cx={100} cy={100} r={36} fill={Colors.sageDeep} opacity={0.18} />
      <SvgText
        x={100}
        y={114}
        textAnchor="middle"
        fontFamily="Georgia"
        fontSize={46}
        fontStyle="italic"
        fill={Colors.sageDeep}
      >
        H
      </SvgText>
    </Svg>
  );
}

export default function DoneScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.cream,
      }}
    >
      {/* Subtle sage gradient tint at top */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          backgroundColor: "rgba(156,175,136,0.10)",
          pointerEvents: "none",
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            paddingHorizontal: 22,
            paddingTop: 70,
            paddingBottom: 40,
            gap: 16,
          }}
        >
          {/* Bloom art */}
          <View style={{ marginTop: 4 }}>
            <BloomArt />
          </View>

          {/* Headline */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 24,
              fontWeight: "500",
              lineHeight: 29,
              letterSpacing: -0.3,
              color: Colors.ink,
              textAlign: "center",
            }}
          >
            You haven't signed up.{"\n"}
            <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>
              You've created an heirloom.
            </Text>
          </Text>

          {/* Sub */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 14,
              color: Colors.inkSoft,
              textAlign: "center",
              lineHeight: 21,
            }}
          >
            One Future Letter, sealed for Maya.{"\n"}Your{" "}
            <Text style={{ fontStyle: "italic" }}>Certificate of Legacy</Text> is in your inbox.
          </Text>

          {/* Receipt card */}
          <View
            style={{
              width: "100%",
              backgroundColor: Colors.paper,
              borderWidth: 1,
              borderColor: Colors.rule,
              borderRadius: 12,
              padding: 14,
              gap: 6,
            }}
          >
            {[
              { label: "For", value: "Maya" },
              { label: "Length", value: "5 min 48 sec" },
              { label: "Opens", value: "June 14, 2034" },
              { label: "Certificate", value: "№ HL-2026-04417" },
            ].map((row) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    letterSpacing: 1.4,
                    color: Colors.inkMuted,
                    textTransform: "uppercase",
                  }}
                >
                  {row.label}
                </Text>
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontSize: 13.5,
                    color: Colors.ink,
                  }}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <Pressable
            onPress={() => router.replace("/(tabs)" as any)}
            style={({ pressed }) => ({
              width: "100%",
              minHeight: 50,
              borderRadius: 26,
              backgroundColor: Colors.ink,
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
                fontSize: 15,
                fontWeight: "500",
                color: Colors.cream,
              }}
            >
              See your Heartloom
            </Text>
          </Pressable>

          {/* Footer note */}
          <Text
            style={{
              textAlign: "center",
              fontSize: 11.5,
              color: Colors.inkMuted,
              lineHeight: 17,
              marginTop: -4,
            }}
          >
            We'll ask about your account next — only what we need to keep this safe.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
