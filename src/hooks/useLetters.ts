import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

type Letter = Database["public"]["Tables"]["letters"]["Row"];
type LetterInsert = Omit<Database["public"]["Tables"]["letters"]["Insert"], "author_id" | "family_id">;

export function useLetters() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["letters", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .eq("author_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Letter[];
    },
    enabled: !!userId,
  });
}

export function usePinnedLetter() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["pinned-letter", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .eq("author_id", userId!)
        .is("delivered_at", null)
        .not("deliver_at", "is", null)
        .order("deliver_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Letter | null;
    },
    enabled: !!userId,
  });
}

export function useCreateLetter() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (letter: LetterInsert & { family_id?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get family_id from profile if not provided. May be null for solo users.
      let familyId: string | null = letter.family_id ?? null;
      if (!familyId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("family_id")
          .eq("id", user.id)
          .single();
        familyId = profile?.family_id ?? null;
      }

      const { data, error } = await supabase
        .from("letters")
        .insert({ ...letter, author_id: user.id, family_id: familyId })
        .select()
        .single();
      if (error) throw error;
      return data as Letter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      queryClient.invalidateQueries({ queryKey: ["pinned-letter"] });
    },
  });
}

export function useDeleteLetter() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ id, mediaUrl }: { id: string; mediaUrl: string | null }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("letters")
        .delete()
        .eq("id", id)
        .eq("author_id", user.id);
      if (error) throw error;

      if (mediaUrl) {
        const { error: storageError } = await supabase.storage
          .from("voice-memos")
          .remove([mediaUrl]);
        if (storageError) {
          console.warn("Failed to delete media from storage:", storageError);
        }
      }
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      queryClient.invalidateQueries({ queryKey: ["pinned-letter"] });
    },
  });
}

export function useUpdateLetter() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<LetterInsert> & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("letters")
        .update(fields)
        .eq("id", id)
        .eq("author_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data as Letter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
    },
  });
}
