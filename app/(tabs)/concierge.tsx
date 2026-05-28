import { Pressable } from "../../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../../src/constants/fonts";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../../src/constants/colors";

const CHIPS = ["Medicare", "Hospice", "Estate logistics"];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ConciergeScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: Colors.bg,
            borderBottomWidth: 1,
            borderBottomColor: Colors.rule,
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
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 22, color: Colors.inkSoft, lineHeight: 26 }}>
              ‹
            </Text>
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
            Concierge
          </Text>

          {/* "Coming soon" badge */}
          <View
            style={{
              minWidth: 72,
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(210,127,20,0.14)",
                borderWidth: 1,
                borderColor: "rgba(210,127,20,0.35)",
                borderRadius: 999,
                paddingHorizontal: 9,
                paddingVertical: 3,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  color: Colors.amberDeep,
                  textTransform: "uppercase",
                }}
              >
                Soon
              </Text>
            </View>
          </View>
        </View>

        {/* ── Scrollable content ────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Animated.View
            style={{ opacity, transform: [{ translateY: slideY }], alignItems: "center" }}
          >
            {/* ── Naomi preview avatar ─────────────────────────────────── */}
            <View style={{ position: "relative", marginTop: 36, marginBottom: 18 }}>
              <View
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  backgroundColor: Colors.sageDeep,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 38,
                    color: "#FFFFFF",
                    fontWeight: "600",
                  }}
                >
                  N
                </Text>
              </View>
            </View>

            {/* ── COMING SOON pill ─────────────────────────────────────── */}
            <View
              style={{
                backgroundColor: "rgba(210,127,20,0.12)",
                borderWidth: 1,
                borderColor: "rgba(210,127,20,0.35)",
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 6,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                  color: Colors.amberDeep,
                  textTransform: "uppercase",
                }}
              >
                Coming Soon
              </Text>
            </View>

            {/* ── Heading ──────────────────────────────────────────────── */}
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                lineHeight: 32,
                color: Colors.ink,
                textAlign: "center",
                marginHorizontal: 32,
                marginBottom: 10,
              }}
            >
              Your Family{" "}
              <Text style={{ fontStyle: "italic", color: Colors.amberDeep }}>
                Concierge.
              </Text>
            </Text>

            {/* ── Value prop ───────────────────────────────────────────── */}
            <Text
              style={{
                fontFamily: SERIF_ITALIC,
                fontStyle: "italic",
                fontSize: 15,
                lineHeight: 23,
                color: Colors.inkSoft,
                textAlign: "center",
                marginHorizontal: 36,
                marginBottom: 22,
              }}
            >
              A real human, in your timezone, who knows your family&apos;s story
              before they pick up — handling Medicare, hospice, and estate calls
              so you never sit on hold again.
            </Text>

            {/* ── Specialty chips ──────────────────────────────────────── */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
                marginHorizontal: 32,
                marginBottom: 28,
              }}
            >
              {CHIPS.map((chip) => (
                <View
                  key={chip}
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.rule,
                    backgroundColor: Colors.cream,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      letterSpacing: 1,
                      color: Colors.ink,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {chip}
                  </Text>
                </View>
              ))}
            </View>

            {/* ── Notify me button ─────────────────────────────────────── */}
            <Pressable
              onPress={() =>
                Alert.alert(
                  "You're on the list",
                  "We'll let you know the moment your Concierge is ready."
                )
              }
              style={({ pressed }) => ({
                backgroundColor: Colors.ink,
                borderRadius: 26,
                paddingVertical: 14,
                paddingHorizontal: 32,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
                marginBottom: 28,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: Colors.bg,
                  letterSpacing: 0.2,
                }}
              >
                Notify me when it&apos;s ready
              </Text>
            </Pressable>

            {/* ── Promise card ─────────────────────────────────────────── */}
            <View
              style={{
                marginHorizontal: 22,
                backgroundColor: "#2C1D10",
                borderWidth: 1,
                borderColor: "rgba(210,127,20,0.20)",
                borderRadius: 16,
                padding: 18,
                paddingBottom: 16,
                overflow: "hidden",
                alignSelf: "stretch",
              }}
            >
              {/* Ambient amber glow */}
              <View
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: "rgba(210,127,20,0.22)",
                  pointerEvents: "none",
                }}
              />

              <Text
                style={{
                  fontFamily: "System",
                  fontSize: 10.5,
                  letterSpacing: 2.9,
                  color: "rgba(245,224,165,0.7)",
                  textTransform: "uppercase",
                  marginBottom: 0,
                }}
              >
                THE LAND OF PROMISE
              </Text>

              <Text
                style={{
                  fontFamily: SERIF_ITALIC,
                  fontStyle: "italic",
                  fontSize: 18,
                  lineHeight: 24,
                  color: Colors.bg,
                  marginTop: 10,
                  marginBottom: 8,
                }}
              >
                &quot;You will never sit on hold for your family again.&quot;
              </Text>

              <Text
                style={{
                  fontFamily: SERIF_ITALIC,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "rgba(245,224,165,0.78)",
                  lineHeight: 19,
                }}
              >
                Naomi Park, RN, MSW — 11 years in geriatric care — will be your
                family&apos;s dedicated guide. We&apos;re putting the finishing
                touches on it now.
              </Text>
            </View>

          </Animated.View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} />
      </SafeAreaView>
    </View>
  );
}
