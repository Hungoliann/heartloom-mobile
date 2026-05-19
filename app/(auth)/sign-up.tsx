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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/auth.store";

export default function SignUpScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCreate = () => {
    const name = `${firstName} ${lastName}`.trim() || "Friend";
    signIn({ id: "mock-user-new", name, email: email || "hello@heartloom.com" });
    router.replace("/(tabs)");
  };

  const canContinue = firstName.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF6EE" }}>
      {/* Decorative circles */}
      <View style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "#8BAE72", opacity: 0.1 }} />
      <View style={{ position: "absolute", top: 180, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "#D4A853", opacity: 0.08 }} />
      <View style={{ position: "absolute", bottom: 100, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: "#D4A853", opacity: 0.07 }} />

      <SafeAreaView style={{ flex: 1 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 20 }}>
          <Text style={{ color: "#8C7B65", fontSize: 15 }}>← Back</Text>
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 36, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
              {/* Logo */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 36 }}>
                <View style={{ width: 18, height: 18, backgroundColor: "#D4A853", transform: [{ rotate: "45deg" }], borderRadius: 3 }} />
                <Text style={{ fontFamily: "Georgia", fontSize: 22, color: "#2C1F0E", letterSpacing: 1 }}>Heartloom</Text>
              </View>

              <Text style={{ fontFamily: "Georgia", fontSize: 28, lineHeight: 38, color: "#2C1F0E", marginBottom: 8 }}>
                Begin your{"\n"}legacy.
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 24, color: "#8C7B65", marginBottom: 40 }}>
                Your stories are worth keeping.{"\n"}Let's start today.
              </Text>

              {/* Name row */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 8 }}>First name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Sarah"
                    placeholderTextColor="#C4B8A6"
                    autoCapitalize="words"
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, fontSize: 16, color: "#2C1F0E", borderWidth: 1.5, borderColor: "#F0E8D8", elevation: 2 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 8 }}>Last name</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Mitchell"
                    placeholderTextColor="#C4B8A6"
                    autoCapitalize="words"
                    style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, fontSize: 16, color: "#2C1F0E", borderWidth: 1.5, borderColor: "#F0E8D8", elevation: 2 }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 8 }}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#C4B8A6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, fontSize: 16, color: "#2C1F0E", borderWidth: 1.5, borderColor: "#F0E8D8", elevation: 2 }}
                />
              </View>

              <View style={{ marginBottom: 36 }}>
                <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8C7B65", marginBottom: 8 }}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#C4B8A6"
                  secureTextEntry
                  style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, fontSize: 16, color: "#2C1F0E", borderWidth: 1.5, borderColor: "#F0E8D8", elevation: 2 }}
                />
              </View>

              <Pressable
                onPress={canContinue ? handleCreate : undefined}
                style={({ pressed }) => ({
                  backgroundColor: canContinue ? "#D4A853" : "#E8D5B0",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  shadowColor: "#D4A853",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: canContinue ? 0.3 : 0,
                  shadowRadius: 14,
                  elevation: canContinue ? 6 : 0,
                })}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "600" }}>
                  Create my account
                </Text>
              </Pressable>

              <Pressable onPress={() => router.back()} style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: "#8C7B65", fontSize: 15 }}>
                  Already have an account?{" "}
                  <Text style={{ color: "#D4A853", fontWeight: "600" }}>Sign in</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
