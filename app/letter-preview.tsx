import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

const AMBER = "#D27F14";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const PARCHMENT = "#FBF2DD";
const BG = "#F5E9D6";

export default function LetterPreviewScreen() {
  const router = useRouter();
  const { firstLine } = useLocalSearchParams<{ firstLine?: string }>();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const waxScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.spring(waxScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }, 350);
  }, []);

  const letterBody = firstLine?.trim()
    ? firstLine.trim()
    : "By the time you read this, I hope you've found the kind of love that makes you laugh at nothing, that makes ordinary Tuesday evenings feel sacred.";

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(45,36,26,0.08)" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="arrow-left" size={20} color={INK_SOFT} />
          </Pressable>
          <Text style={{ flex: 1, fontSize: 15, fontFamily: "Georgia", fontWeight: "600", color: INK }}>Your Future Letter</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
            {/* Teaser label */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ backgroundColor: "rgba(210,127,20,0.12)", borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(210,127,20,0.22)" }}>
                <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "#7A4820", textTransform: "uppercase" }}>
                  Preview · sealed until delivered
                </Text>
              </View>
            </View>

            {/* Parchment document */}
            <View
              style={{
                backgroundColor: PARCHMENT,
                borderRadius: 6,
                padding: 24,
                paddingLeft: 32,
                borderWidth: 1,
                borderColor: "rgba(169,95,10,0.15)",
                shadowColor: "#4A2F18",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 6,
                overflow: "hidden",
              }}
            >
              {/* Left binding lines */}
              <View style={{ position: "absolute", left: 18, top: 12, bottom: 12, width: 1, backgroundColor: "rgba(169,95,10,0.3)" }} />
              <View style={{ position: "absolute", left: 14, top: 12, bottom: 12, width: 1, backgroundColor: "rgba(169,95,10,0.15)" }} />

              {/* Wax seal */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#8A3A0E",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: waxScale }, { rotate: "-12deg" }],
                  shadowColor: "#5E240A",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.55,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontWeight: "700", fontSize: 24, color: "#F3C896" }}>H</Text>
              </Animated.View>

              {/* Document header */}
              <View style={{ alignItems: "center", marginBottom: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(169,95,10,0.1)", paddingRight: 60 }}>
                <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(74,47,24,0.5)", marginBottom: 4 }}>
                  A Future Letter
                </Text>
                <Text style={{ fontFamily: "Georgia", fontSize: 11, color: "rgba(74,47,24,0.65)", fontStyle: "italic" }}>
                  from <Text style={{ fontSize: 16, fontStyle: "normal", fontWeight: "600", color: "#4A2F18" }}>You</Text>
                </Text>
              </View>

              {/* Letter body */}
              <Text style={{ fontFamily: "Georgia", fontWeight: "600", fontSize: 11, color: "#4A2F18", marginBottom: 12 }}>
                To my daughter, Maya
              </Text>

              <Text style={{ fontFamily: "Georgia", fontSize: 14.5, lineHeight: 23, color: "#2B2118", fontWeight: "500", marginBottom: 14 }}>
                {letterBody}
              </Text>

              {firstLine?.trim() ? null : (
                <Text style={{ fontFamily: "Georgia", fontSize: 14.5, lineHeight: 23, color: "#2B2118", fontWeight: "500", marginBottom: 14 }}>
                  I leave you the cabin in Tahoe, the recipe box from my mother, and the letter inside the second drawer of my writing desk. You'll know when it's time to open it.
                </Text>
              )}

              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 13, color: "#4A2F18", marginBottom: 20 }}>
                With all my love,{"\n"}
                <Text style={{ fontFamily: "Georgia", fontSize: 18, fontWeight: "600", fontStyle: "normal" }}>Mom</Text>
              </Text>

              {/* Sign line */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(169,95,10,0.15)" }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "rgba(74,47,24,0.25)" }} />
                <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 8.5, letterSpacing: 1.2, color: "rgba(74,47,24,0.45)", textTransform: "uppercase" }}>
                  Signed & sealed · Opens on their wedding day
                </Text>
              </View>
            </View>

            {/* Pitch text */}
            <View style={{ marginTop: 24, alignItems: "center", paddingHorizontal: 8 }}>
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 17, color: INK, textAlign: "center", lineHeight: 25, marginBottom: 6 }}>
                This is what you're building.
              </Text>
              <Text style={{ fontSize: 13, color: INK_MUTED, textAlign: "center", lineHeight: 20 }}>
                Create an account to seal it, address it, and choose the day it opens.
              </Text>
            </View>

            {/* CTAs */}
            <View style={{ marginTop: 24, gap: 10 }}>
              <Pressable
                onPress={() => router.push("/(auth)/sign-up")}
                style={({ pressed }) => ({
                  backgroundColor: AMBER,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: pressed ? 0.88 : 1,
                  shadowColor: AMBER,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.45,
                  shadowRadius: 16,
                  elevation: 6,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>Create my account</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/(auth)/sign-in")}
                style={({ pressed }) => ({
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "rgba(45,36,26,0.18)",
                  backgroundColor: "rgba(45,36,26,0.04)",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 15, color: INK_SOFT, fontWeight: "500" }}>I already have an account</Text>
              </Pressable>
            </View>

            <Text style={{ fontSize: 11, color: INK_MUTED, textAlign: "center", marginTop: 16, lineHeight: 17 }}>
              Free to start. We only ask for more when life does.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
