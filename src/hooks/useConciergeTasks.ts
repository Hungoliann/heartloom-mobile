import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

type Task = Database["public"]["Tables"]["concierge_tasks"]["Row"];

export function useConciergeTasks() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["concierge_tasks", userId],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", userId!)
        .single();
      if (profileError) throw profileError;

      if (!profile.family_id) return [] as Task[];

      const { data, error } = await supabase
        .from("concierge_tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!userId,
  });
}
