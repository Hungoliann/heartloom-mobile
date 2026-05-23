import { useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const AMBER = "#D27F14";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const PARCHMENT = "#FBF2DD";

export default function LetterScreen() {
  const router = useRouter();
  const waxScale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.spring(waxScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }, 350);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5E9D6" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(45,36,26,0.08)" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="x" size={20} color={INK_SOFT} />
          </Pressable>
          <Text style={{ flex: 1, fontSize: 15, fontFamily: "Georgia", fontWeight: "600", color: INK }}>Future Letter</Text>
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}>
            <Feather name="share-2" size={18} color={INK_SOFT} />
          </Pressable>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        >
          {/* Delivery status pill */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, backgroundColor: "rgba(210,127,20,0.1)", borderRadius: 12, padding: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: AMBER }} />
            <Text style={{ fontSize: 12, color: "#7A4820", fontWeight: "500", flex: 1 }}>Sealed · Opens June 14, 2034</Text>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontSize: 11, color: AMBER, fontWeight: "600" }}>Edit →</Text>
            </Pressable>
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
                from{" "}
                <Text style={{ fontSize: 16, fontStyle: "normal", fontWeight: "600", color: "#4A2F18" }}>Eleanor M. Hayes</Text>
              </Text>
            </View>

            {/* Letter body */}
            <Text style={{ fontFamily: "Georgia", fontWeight: "600", fontSize: 11, color: "#4A2F18", marginBottom: 12 }}>
              To my daughter, Maya
            </Text>

            <Text style={{ fontFamily: "Georgia", fontSize: 14.5, lineHeight: 23, color: "#2B2118", fontWeight: "500", marginBottom: 14 }}>
              By the time you read this, I hope you've found the kind of love that makes you laugh at nothing, that makes ordinary Tuesday evenings feel sacred.
            </Text>

            <Text style={{ fontFamily: "Georgia", fontSize: 14.5, lineHeight: 23, color: "#2B2118", fontWeight: "500", marginBottom: 14 }}>
              I leave you the cabin in Tahoe, the recipe box from my mother, and the letter inside the second drawer of my writing desk. You'll know when it's time to open it.
            </Text>

            <Text style={{ fontFamily: "Georgia", fontSize: 14.5, lineHeight: 23, color: "#2B2118", fontWeight: "500", marginBottom: 20 }}>
              Most of all, I leave you my certainty: that you were the bravest thing I ever did.
            </Text>

            <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 13, color: "#4A2F18", marginBottom: 20 }}>
              With all my love,{"\n"}
              <Text style={{ fontFamily: "Georgia", fontSize: 18, fontWeight: "600", fontStyle: "normal" }}>Mom</Text>
            </Text>

            {/* Sign line */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(169,95,10,0.15)" }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "rgba(74,47,24,0.25)" }} />
              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 8.5, letterSpacing: 1.2, color: "rgba(74,47,24,0.45)", textTransform: "uppercase" }}>
                Signed & sealed · May 19, 2026
              </Text>
            </View>
          </View>

          {/* Metadata rows */}
          <View style={{ marginTop: 18, backgroundColor: "#FFFFFF", borderRadius: 14, overflow: "hidden", shadowColor: INK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            {[
              ["Recipient", "Maya"],
              ["Opens when", "June 14, 2034"],
              ["Delivery", "Push notification + email"],
              ["Certificate", "HL-A3F82C1D"],
            ].map(([label, value], i, arr) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 13,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(45,36,26,0.06)",
                }}
              >
                <Text style={{ fontSize: 12.5, color: INK_MUTED }}>{label}</Text>
                <Text style={{ fontSize: 12.5, fontWeight: "500", color: INK_SOFT, maxWidth: "60%", textAlign: "right" }}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={{ marginTop: 18, gap: 10 }}>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: "#4A2F18",
                borderRadius: 13,
                paddingVertical: 15,
                alignItems: "center",
                opacity: pressed ? 0.88 : 1,
                shadowColor: "#4A2F18",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 4,
              })}
            >
              <Text style={{ fontSize: 14.5, fontWeight: "600", color: "#FBF2DD" }}>Edit Letter</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                borderRadius: 13,
                paddingVertical: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(45,36,26,0.14)",
                opacity: pressed ? 0.75 : 1,
                flexDirection: "row",
                justifyContent: "center",
                gap: 7,
              })}
            >
              <Feather name="download" size={14} color={INK_SOFT} />
              <Text style={{ fontSize: 14, color: INK_SOFT }}>Download PDF</Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
