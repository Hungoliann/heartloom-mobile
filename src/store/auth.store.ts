import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { supabase } from "../lib/supabase";

const HAS_ONBOARDED_KEY = "hasOnboarded";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  hasOnboarded: boolean;
  signIn: (user: AppUser) => void;
  signOut: () => Promise<void>;
  setHasOnboarded: () => void;
  initialize: () => Promise<() => void>;
}

function supabaseUserToAppUser(
  supabaseUser: { id: string; email?: string | null },
  fullName?: string | null
): AppUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: fullName ?? supabaseUser.email?.split("@")[0] ?? "Friend",
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  hasOnboarded: false,

  signIn: (user) => set({ user }),

  signOut: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(HAS_ONBOARDED_KEY);
    set({ user: null, hasOnboarded: false });
  },

  setHasOnboarded: () => {
    AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true").catch(() => {
      // Best-effort persistence; in-memory state is already set.
    });
    set({ hasOnboarded: true });
  },

  initialize: async () => {
    // Restore hasOnboarded independently of the Supabase session so that
    // users who completed onboarding are not sent back to /onboarding on
    // cold restart, even if their session has expired.
    const storedOnboarded = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
    const hasOnboarded = storedOnboarded === "true";

    // Supabase persists the auth tokens in its own storage and restores them
    // via getSession() on cold start — no extra work needed for user session.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      set({
        user: supabaseUserToAppUser(session.user, profile?.full_name),
        isLoading: false,
        hasOnboarded: true,
      });
    } else {
      set({ isLoading: false, hasOnboarded });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single();

        set({
          user: supabaseUserToAppUser(session.user, profile?.full_name),
          hasOnboarded: true,
          isLoading: false,
        });
      } else if (event === "SIGNED_OUT") {
        set({ user: null });
      }
    });

    return () => subscription.unsubscribe();
  },
}));
