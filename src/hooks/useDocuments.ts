import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Omit<Database["public"]["Tables"]["documents"]["Insert"], "owner_id" | "family_id">;

export function useDocuments(category?: Document["category"]) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["documents", userId, category],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*")
        .eq("owner_id", userId!)
        .order("created_at", { ascending: false })
        .limit(100);

      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!userId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (doc: DocumentInsert & { family_id?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      let familyId = doc.family_id;
      if (!familyId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("family_id")
          .eq("id", user.id)
          .single();
        familyId = profile?.family_id ?? "";
      }

      const { data, error } = await supabase
        .from("documents")
        .insert({ ...doc, owner_id: user.id, family_id: familyId ?? "" })
        .select()
        .single();
      if (error) throw error;
      return data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
