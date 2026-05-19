import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/auth.store";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  if (user) return <Redirect href="/(tabs)" />;
  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(auth)/sign-in" />;
}
