import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, Animated, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../src/store/auth.store";

const BG = "#1A1108";
const AMBER = "#D27F14";
const CREAM = "#FAF3E2";
const CREAM_DIM = "rgba(250,243,226,0.78)";
const RULE = "rgba(74,47,24,0.35)";
const INPUT_BG = "rgba(250,243,226,0.05)";

export default function SignInScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [firstLine, setFirstLine] = useState("");
  const [step, setStep] = useState<"welcome" | "auth">("welcome");

  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleContinue() {
    if (step === "welcome") {
      setStep("auth");
      return;
    }
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    signIn({ id: "user-1", name, email });
    router.replace((next as any) ?? "/(tabs)");
  }

  const canContinue = step === "welcome" ? firstLine.trim().length > 0 : email.trim().length > 0;

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
              {/* Logo + wordmark */}
              <View style={{ alignItems: "center", marginBottom: 44 }}>
                <Text style={{ fontSize: 36, color: AMBER, marginBottom: 12 }}>♡</Text>
                <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 4, color: CREAM, textTransform: "uppercase" }}>
                  HEARTLOOM
                </Text>
              </View>

              {step === "welcome" ? (
                <>
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 27, lineHeight: 36, color: CREAM, textAlign: "center", marginBottom: 10, fontWeight: "500" }}>
                    What is one thing{"\n"}you want them{"\n"}to{" "}
                    <Text style={{ color: AMBER, fontStyle: "italic" }}>know forever?</Text>
                  </Text>
                  <Text style={{ fontSize: 13.5, color: CREAM_DIM, textAlign: "center", lineHeight: 20, marginBottom: 34, fontFamily: "Georgia" }}>
                    A sentence is enough. We'll thread it into something that lasts.
                  </Text>

                  {/* First-line textarea */}
                  <View style={{ backgroundColor: INPUT_BG, borderRadius: 14, borderWidth: 1, borderColor: RULE, padding: 16, marginBottom: 20 }}>
                    <TextInput
                      value={firstLine}
                      onChangeText={setFirstLine}
                      placeholder="Be brave enough to be soft…"
                      placeholderTextColor="rgba(250,243,226,0.25)"
                      style={{ fontSize: 15, color: CREAM, lineHeight: 22, minHeight: 72 }}
                      multiline
                      maxLength={240}
                    />
                    <Text style={{ fontSize: 9.5, color: "rgba(250,243,226,0.25)", textAlign: "right", marginTop: 6 }}>
                      {firstLine.length} / 240
                    </Text>
                  </View>

                  {/* Primary CTA */}
                  <Pressable
                    onPress={handleContinue}
                    style={({ pressed }) => ({
                      backgroundColor: canContinue ? AMBER : "rgba(210,127,20,0.28)",
                      borderRadius: 14,
                      paddingVertical: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: pressed ? 0.85 : 1,
                      marginBottom: 12,
                      shadowColor: AMBER,
                      shadowOffset: { width: 0, height: canContinue ? 8 : 0 },
                      shadowOpacity: canContinue ? 0.5 : 0,
                      shadowRadius: 16,
                      elevation: canContinue ? 6 : 0,
                    })}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "600", color: canContinue ? "#FFFFFF" : "rgba(250,243,226,0.4)" }}>
                      Draft Your First Future Letter
                    </Text>
                  </Pressable>

                  {/* Secondary: record option */}
                  <Pressable
                    onPress={() => setStep("auth")}
                    style={({ pressed }) => ({
                      borderRadius: 14,
                      paddingVertical: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderWidth: 1,
                      borderColor: RULE,
                      opacity: pressed ? 0.7 : 1,
                      marginBottom: 36,
                    })}
                  >
                    <View style={{ width: 17, height: 17, borderRadius: 8.5, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
                      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" }} />
                    </View>
                    <Text style={{ fontSize: 14, color: CREAM_DIM }}>Record 60 seconds instead</Text>
                  </Pressable>

                  <Text style={{ fontSize: 11, color: "rgba(250,243,226,0.32)", textAlign: "center", lineHeight: 17 }}>
                    No account yet. No payment.{"\n"}We'll only ask for more when life does.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 26, lineHeight: 34, color: CREAM, textAlign: "center", marginBottom: 8, fontWeight: "500" }}>
                    One last step.{"\n"}
                    <Text style={{ color: AMBER }}>Save your letter.</Text>
                  </Text>
                  <Text style={{ fontSize: 13, color: CREAM_DIM, textAlign: "center", lineHeight: 19, marginBottom: 32 }}>
                    Your words are kept safe and private.
                  </Text>

                  <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: RULE, paddingHorizontal: 16, marginBottom: 12 }}>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Your email address"
                      placeholderTextColor="rgba(250,243,226,0.28)"
                      style={{ fontSize: 14.5, color: CREAM, paddingVertical: 16 }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <Pressable
                    onPress={handleContinue}
                    style={({ pressed }) => ({
                      backgroundColor: canContinue ? AMBER : "rgba(210,127,20,0.28)",
                      borderRadius: 14,
                      paddingVertical: 16,
                      alignItems: "center",
                      opacity: pressed ? 0.85 : 1,
                      marginBottom: 20,
                      shadowColor: AMBER,
                      shadowOffset: { width: 0, height: canContinue ? 8 : 0 },
                      shadowOpacity: canContinue ? 0.5 : 0,
                      shadowRadius: 16,
                      elevation: canContinue ? 6 : 0,
                    })}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "600", color: canContinue ? "#FFFFFF" : "rgba(250,243,226,0.4)" }}>
                      Continue
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => setStep("welcome")} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, alignItems: "center" })}>
                    <Text style={{ fontSize: 13, color: "rgba(250,243,226,0.4)" }}>‹ Go back</Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
