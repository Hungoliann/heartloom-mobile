import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/store/auth.store";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5EDDF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#D27F14" />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)" />;
  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(auth)/sign-in" />;
}
