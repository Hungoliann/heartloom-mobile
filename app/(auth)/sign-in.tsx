import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { Colors } from "../../src/constants/colors";

const BG = "#1A1108";
const CREAM_DIM = "rgba(250,243,226,0.78)";
const RULE = "rgba(74,47,24,0.35)";
const INPUT_BG = "rgba(250,243,226,0.05)";
const ERROR = "#E05C5C";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const canContinue = email.trim().length > 0 && password.length >= 6;

  async function handleSignIn() {
    if (!canContinue || isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsSubmitting(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
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
              <View style={{ alignItems: "center", marginBottom: 44 }}>
                <Text style={{ fontSize: 36, color: Colors.amber, marginBottom: 12 }}>♡</Text>
                <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 4, color: Colors.cream, textTransform: "uppercase" }}>
                  HEARTLOOM
                </Text>
              </View>

              <Text style={{ fontFamily: "Georgia", fontStyle: "italic", fontSize: 26, lineHeight: 34, color: Colors.cream, textAlign: "center", marginBottom: 8, fontWeight: "500" }}>
                Welcome back.{"\n"}
                <Text style={{ color: Colors.amber }}>Your letters are waiting.</Text>
              </Text>
              <Text style={{ fontSize: 13, color: CREAM_DIM, textAlign: "center", lineHeight: 19, marginBottom: 36 }}>
                Your words are kept safe and private.
              </Text>

              {/* Email */}
              <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: RULE, paddingHorizontal: 16, marginBottom: 12 }}>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(""); }}
                  placeholder="Your email address"
                  placeholderTextColor="rgba(250,243,226,0.28)"
                  style={{ fontSize: 14.5, color: Colors.cream, paddingVertical: 16 }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={{ backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: RULE, paddingHorizontal: 16, marginBottom: 12 }}>
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  placeholder="Password"
                  placeholderTextColor="rgba(250,243,226,0.28)"
                  style={{ fontSize: 14.5, color: Colors.cream, paddingVertical: 16 }}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                />
              </View>

              {error ? (
                <Text style={{ fontSize: 13, color: ERROR, textAlign: "center", marginBottom: 12 }}>{error}</Text>
              ) : null}

              <Pressable
                onPress={handleSignIn}
                disabled={!canContinue || isSubmitting}
                style={({ pressed }) => ({
                  backgroundColor: canContinue ? Colors.amber : "rgba(210,127,20,0.28)",
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                  marginBottom: 12,
                  shadowColor: Colors.amber,
                  shadowOffset: { width: 0, height: canContinue ? 8 : 0 },
                  shadowOpacity: canContinue ? 0.5 : 0,
                  shadowRadius: 16,
                  elevation: canContinue ? 6 : 0,
                })}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: "600", color: canContinue ? "#FFFFFF" : "rgba(250,243,226,0.4)" }}>
                    Sign in
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.push("/(auth)/sign-up")}
                style={({ pressed }) => ({
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: RULE,
                  backgroundColor: "rgba(250,243,226,0.06)",
                  opacity: pressed ? 0.7 : 1,
                  marginBottom: 20,
                })}
              >
                <Text style={{ fontSize: 14, color: CREAM_DIM }}>
                  Don't have an account?{" "}
                  <Text style={{ color: Colors.amber, fontWeight: "600" }}>Create one</Text>
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  borderRadius: 999,
                  paddingVertical: 11,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                  borderWidth: 1,
                  borderColor: "rgba(250,243,226,0.12)",
                  backgroundColor: "rgba(250,243,226,0.04)",
                })}
              >
                <Text style={{ fontSize: 13, color: "rgba(250,243,226,0.4)" }}>‹ Go back</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
