import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageWithProfile = Message & { profiles: { full_name: string | null } | null };

export function useMessages() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      // Get family_id from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", userId!)
        .single();
      if (profileError) throw profileError;

      const familyId = profile?.family_id;
      if (!familyId) return [] as MessageWithProfile[];

      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles(full_name)")
        .eq("family_id", familyId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MessageWithProfile[];
    },
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ body }: { body: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;

      const familyId = profile?.family_id ?? "";

      const { data, error } = await supabase
        .from("messages")
        .insert({
          body,
          author_id: user.id,
          family_id: familyId,
          message_type: "text",
        })
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
