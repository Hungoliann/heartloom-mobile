import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, SplashScreen } from "expo-router";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  useFonts,
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_500Medium,
  Lora_500Medium_Italic,
} from "@expo-google-fonts/lora";
import { useAuthStore } from "../src/store/auth.store";
import { supabase } from "../src/lib/supabase";
import "../global.css";

// Prevent the splash screen from auto-hiding before auth initializes
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 },
  },
});

// Show notifications while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AuthBootstrap() {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initialize().then((unsub) => {
      cleanup = unsub;
      SplashScreen.hideAsync();
    });
    return () => cleanup?.();
  }, []);
  return null;
}

function PushNotificationBootstrap() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    async function registerToken() {
      if (!Device.isDevice) return;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Heartloom",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "57073d2b-8afb-4356-813a-17d8185b4689",
      });

      // Write the token to BOTH locations:
      //  - profiles.push_token: preferred by the delivery worker (no admin API needed)
      //  - auth.users.user_metadata.push_token: kept as a backup fallback
      try {
        if (user?.id) {
          const { error: profileErr } = await supabase
            .from("profiles")
            // push_token column added via SETUP.sql; generated types haven't been refreshed yet.
            .update({ push_token: tokenData.data } as never)
            .eq("id", user.id);
          if (profileErr) {
            console.warn("[push] failed to write profiles.push_token:", profileErr.message);
          }
        }
      } catch (e) {
        console.warn("[push] profiles.push_token update threw:", e);
      }

      try {
        const { error: authErr } = await supabase.auth.updateUser({
          data: { push_token: tokenData.data },
        });
        if (authErr) {
          console.warn("[push] failed to write auth user_metadata.push_token:", authErr.message);
        }
      } catch (e) {
        console.warn("[push] auth.updateUser threw:", e);
      }
    }

    registerToken();

    // Navigate to the letter screen when user taps a delivery notification
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const letterId = response.notification.request.content.data?.letterId as string | undefined;
      if (letterId) {
        router.push({ pathname: "/letter", params: { letterId } } as any);
      }
    });

    return () => sub.remove();
  }, [user?.id]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_500Medium,
    Lora_500Medium_Italic,
  });

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <PushNotificationBootstrap />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="record"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="stories"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="letter"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="memory"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="plans"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="done"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="onboarding-form"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="letter-preview"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="daily-prompt" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="planner" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="archive" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="will" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="privacy" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="terms" options={{ animation: "slide_from_right" }} />
      </Stack>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
