import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useFamily() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["family", userId],
    queryFn: async () => {
      // 1. Get current user's family_id
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", userId!)
        .single();

      if (!myProfile?.family_id) return [];

      // 2. Get all profiles in the same family
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", myProfile.family_id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!userId,
  });
}
