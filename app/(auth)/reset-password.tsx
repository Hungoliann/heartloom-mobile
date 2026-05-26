import { Pressable } from "../../src/components/ui/Pressable";
import { SERIF_ITALIC } from "../../src/constants/fonts";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { Colors } from "../../src/constants/colors";

const BG = "#1A1108";
const CREAM_DIM = "rgba(250,243,226,0.78)";
const RULE = "rgba(74,47,24,0.35)";
const INPUT_BG = "rgba(250,243,226,0.05)";
const ERROR = "#E05C5C";

// Deep-linked from Supabase recovery emails (heartloom://reset-password?...).
// At this point the user has an active session from the magic link, so
// supabase.auth.updateUser({ password }) is enough to set a new password.
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supabase PKCE recovery: the email link routes here with ?code=…
  // Exchange it for an active session so updateUser({password}) works.
  useEffect(() => {
    if (!code) return;
    supabase.auth.exchangeCodeForSession(code).catch((e) => {
      console.warn("[reset-password] exchangeCodeForSession failed:", e?.message);
      setError("This reset link is invalid or has expired. Request a new one.");
    });
  }, [code]);

  const canSubmit =
    password.length >= 6 && password === confirm && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace("/(tabs)");
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 28,
              paddingTop: 64,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={{
                fontFamily: SERIF_ITALIC,
                fontStyle: "italic",
                fontSize: 26,
                lineHeight: 34,
                color: Colors.cream,
                textAlign: "center",
                marginBottom: 12,
                fontWeight: "500",
              }}
            >
              Set a new password.
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: CREAM_DIM,
                textAlign: "center",
                lineHeight: 19,
                marginBottom: 36,
              }}
            >
              At least 6 characters. You'll stay signed in.
            </Text>

            <View
              style={{
                backgroundColor: INPUT_BG,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: RULE,
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError("");
                }}
                placeholder="New password"
                placeholderTextColor="rgba(250,243,226,0.28)"
                style={{
                  fontSize: 14.5,
                  color: Colors.cream,
                  paddingVertical: 16,
                }}
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            <View
              style={{
                backgroundColor: INPUT_BG,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: RULE,
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <TextInput
                value={confirm}
                onChangeText={(t) => {
                  setConfirm(t);
                  setError("");
                }}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(250,243,226,0.28)"
                style={{
                  fontSize: 14.5,
                  color: Colors.cream,
                  paddingVertical: 16,
                }}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error ? (
              <Text
                style={{
                  fontSize: 13,
                  color: ERROR,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                {error}
              </Text>
            ) : null}

            {password.length > 0 && confirm.length > 0 && password !== confirm ? (
              <Text
                style={{
                  fontSize: 12,
                  color: CREAM_DIM,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Passwords don't match yet.
              </Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => ({
                backgroundColor: canSubmit
                  ? Colors.amber
                  : "rgba(210,127,20,0.55)",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: canSubmit ? "#FFFFFF" : "rgba(250,243,226,0.85)",
                  }}
                >
                  Save new password
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
