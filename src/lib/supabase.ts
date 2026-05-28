import "react-native-url-polyfill/auto";
import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// SecureStore has a 2048-byte value limit; chunk large auth tokens to stay under it.
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    const countStr = await SecureStore.getItemAsync(`${key}_count`);
    if (!countStr) return SecureStore.getItemAsync(key);
    const count = parseInt(countStr, 10);
    let result = "";
    for (let i = 0; i < count; i++) {
      result += (await SecureStore.getItemAsync(`${key}_chunk_${i}`)) ?? "";
    }
    return result || null;
  },
  setItem: async (key: string, value: string) => {
    const chunkSize = 2000;
    if (value.length <= chunkSize) {
      await SecureStore.setItemAsync(`${key}_count`, "");
      return SecureStore.setItemAsync(key, value);
    }
    const chunks = Math.ceil(value.length / chunkSize);
    await SecureStore.setItemAsync(`${key}_count`, String(chunks));
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(
        `${key}_chunk_${i}`,
        value.slice(i * chunkSize, (i + 1) * chunkSize)
      );
    }
  },
  removeItem: async (key: string) => {
    const countStr = await SecureStore.getItemAsync(`${key}_count`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_count`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// React Native requires manually toggling Supabase's auto-refresh based on app
// foreground/background state. Without this, autoRefreshToken does nothing and
// sessions expire silently while the app is backgrounded.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
