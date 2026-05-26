import { Pressable } from "../src/components/ui/Pressable";
import { SERIF_ITALIC } from "../src/constants/fonts";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../src/constants/colors";

const BG = "#1A1108";
const CREAM_DIM = "rgba(250,243,226,0.78)";
const RULE = "rgba(74,47,24,0.35)";
const INPUT_BG = "rgba(250,243,226,0.05)";

export default function OnboardingFormScreen() {
  const router = useRouter();
  const [firstLine, setFirstLine] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const canContinue = firstLine.trim().length > 0;

  function handleDraft() {
    router.push({ pathname: "/letter-preview", params: { firstLine } });
  }

  function handleRecord() {
    router.push("/record");
  }

  function handleSkip() {
    router.push("/letter-preview");
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Ambient glows */}
      <View style={{ position: "absolute", top: -100, right: -120, width: 440, height: 320, borderRadius: 220, backgroundColor: "rgba(210,127,20,0.1)" }} />
      <View style={{ position: "absolute", bottom: -120, left: -120, width: 420, height: 360, borderRadius: 210, backgroundColor: "rgba(156,175,136,0.07)" }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ flex: 1, opacity, transform: [{ translateY: slideY }] }}>
              {/* Logo */}
              <View style={{ alignItems: "center", marginBottom: 44 }}>
                <Text style={{ fontSize: 36, color: Colors.amber, marginBottom: 12 }}>♡</Text>
                <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 4, color: Colors.cream, textTransform: "uppercase" }}>
                  HEARTLOOM
                </Text>
              </View>

              <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 27, lineHeight: 36, color: Colors.cream, textAlign: "center", marginBottom: 10, fontWeight: "500" }}>
                What is one thing{"\n"}you want them{"\n"}to{" "}
                <Text style={{ color: Colors.amber, fontStyle: "italic" }}>know forever?</Text>
              </Text>
              <Text style={{ fontSize: 13.5, color: CREAM_DIM, textAlign: "center", lineHeight: 20, marginBottom: 34, fontFamily: SERIF_ITALIC }}>
                A sentence is enough. We'll thread it into something that lasts.
              </Text>

              {/* Textarea */}
              <View style={{ backgroundColor: INPUT_BG, borderRadius: 14, borderWidth: 1, borderColor: RULE, padding: 16, marginBottom: 20 }}>
                <TextInput
                  value={firstLine}
                  onChangeText={setFirstLine}
                  placeholder="Be brave enough to be soft…"
                  placeholderTextColor="rgba(250,243,226,0.25)"
                  style={{ fontSize: 15, color: Colors.cream, lineHeight: 22, minHeight: 72 }}
                  multiline
                  maxLength={240}
                />
                <Text style={{ fontSize: 9.5, color: "rgba(250,243,226,0.25)", textAlign: "right", marginTop: 6 }}>
                  {firstLine.length} / 240
                </Text>
              </View>

              {/* Primary CTA */}
              <Pressable
                onPress={handleDraft}
                style={({ pressed }) => ({
                  backgroundColor: canContinue ? Colors.amber : "rgba(210,127,20,0.28)",
                  borderRadius: 14,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.85 : 1,
                  marginBottom: 12,
                  shadowColor: Colors.amber,
                  shadowOffset: { width: 0, height: canContinue ? 8 : 0 },
                  shadowOpacity: canContinue ? 0.5 : 0,
                  shadowRadius: 16,
                  elevation: canContinue ? 6 : 0,
                })}
              >
                <Ionicons
                  name="create-outline"
                  size={17}
                  color={canContinue ? "#FFFFFF" : "rgba(250,243,226,0.4)"}
                />
                <Text style={{ fontSize: 15, fontWeight: "600", color: canContinue ? "#FFFFFF" : "rgba(250,243,226,0.4)" }}>
                  Draft Your First Future Letter
                </Text>
              </Pressable>

              {/* Record CTA */}
              <Pressable
                onPress={handleRecord}
                style={({ pressed }) => ({
                  borderRadius: 14,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1.5,
                  borderColor: RULE,
                  backgroundColor: "rgba(250,243,226,0.06)",
                  opacity: pressed ? 0.7 : 1,
                  marginBottom: 24,
                })}
              >
                <View style={{ width: 17, height: 17, borderRadius: 8.5, backgroundColor: Colors.amber, alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" }} />
                </View>
                <Text style={{ fontSize: 14, color: CREAM_DIM }}>Record 60 seconds instead</Text>
              </Pressable>

              {/* Skip */}
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => ({
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 999,
                  opacity: pressed ? 0.6 : 1,
                  borderWidth: 1,
                  borderColor: "rgba(250,243,226,0.15)",
                  backgroundColor: "rgba(250,243,226,0.05)",
                })}
              >
                <Text style={{ fontSize: 13, color: "rgba(250,243,226,0.5)" }}>Skip, show me an example first</Text>
              </Pressable>

              <Text style={{ fontSize: 11, color: "rgba(250,243,226,0.32)", textAlign: "center", lineHeight: 17, marginTop: 24 }}>
                No account yet. No payment.{"\n"}We'll only ask for more when life does.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
