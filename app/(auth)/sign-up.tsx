import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";

const BG = "#FAF6EE";
const INK = "#2C1F0E";
const AMBER = "#D4A853";
const MUTED = "#8C7B65";
const BORDER = "#F0E8D8";
const ERROR = "#E05C5C";

export default function SignUpScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const canContinue =
    firstName.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  async function handleCreate() {
    if (!canContinue || isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setIsSubmitting(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    setIsSubmitting(false);
    router.replace("/(tabs)");
  }

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: INK,
    borderWidth: 1.5,
    borderColor: BORDER,
  } as const;

  const labelStyle = {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    color: MUTED,
    marginBottom: 8,
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "#8BAE72", opacity: 0.1 }} />
      <View style={{ position: "absolute", top: 180, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: AMBER, opacity: 0.08 }} />

      <SafeAreaView style={{ flex: 1 }}>
        <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <Text style={{ color: MUTED, fontSize: 15 }}>‹ Back</Text>
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28, marginTop: 8 }}>
                <View style={{ width: 18, height: 18, backgroundColor: AMBER, transform: [{ rotate: "45deg" }], borderRadius: 3 }} />
                <Text style={{ fontFamily: "Georgia", fontSize: 22, color: INK, letterSpacing: 1 }}>Heartloom</Text>
              </View>

              <Text style={{ fontFamily: "Georgia", fontSize: 28, lineHeight: 38, color: INK, marginBottom: 8 }}>
                Begin your{"\n"}legacy.
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 24, color: MUTED, marginBottom: 32 }}>
                Your stories are worth keeping.{"\n"}Let's start today.
              </Text>

              {/* Name row */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>First name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={(t) => { setFirstName(t); setError(""); }}
                    placeholder="Sarah"
                    placeholderTextColor="#C4B8A6"
                    autoCapitalize="words"
                    returnKeyType="next"
                    style={inputStyle}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>Last name</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Mitchell"
                    placeholderTextColor="#C4B8A6"
                    autoCapitalize="words"
                    returnKeyType="next"
                    style={inputStyle}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={labelStyle}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(""); }}
                  placeholder="your@email.com"
                  placeholderTextColor="#C4B8A6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  style={inputStyle}
                />
              </View>

              <View style={{ marginBottom: 8 }}>
                <Text style={labelStyle}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#C4B8A6"
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleCreate}
                  style={inputStyle}
                />
              </View>

              {error ? (
                <Text style={{ fontSize: 13, color: ERROR, marginBottom: 12 }}>{error}</Text>
              ) : (
                <View style={{ height: 24 }} />
              )}

              <Pressable
                onPress={handleCreate}
                disabled={!canContinue || isSubmitting}
                style={({ pressed }) => ({
                  backgroundColor: canContinue ? AMBER : "#E8D5B0",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  shadowColor: AMBER,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: canContinue ? 0.3 : 0,
                  shadowRadius: 14,
                  elevation: canContinue ? 6 : 0,
                })}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "600" }}>
                    Create my account
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.push("/(auth)/sign-in")}
                style={({ pressed }) => ({
                  marginTop: 16,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "rgba(45,36,26,0.18)",
                  borderRadius: 14,
                  paddingVertical: 14,
                  backgroundColor: "rgba(45,36,26,0.04)",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text style={{ color: MUTED, fontSize: 15 }}>
                  Already have an account?{" "}
                  <Text style={{ color: AMBER, fontWeight: "600" }}>Sign in</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
