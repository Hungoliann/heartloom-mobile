import { create } from "zustand";
import { supabase } from "../lib/supabase";

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
    set({ user: null, hasOnboarded: false });
  },

  setHasOnboarded: () => set({ hasOnboarded: true }),

  initialize: async () => {
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
      set({ isLoading: false });
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
