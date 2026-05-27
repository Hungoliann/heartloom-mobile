import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

// NOTE: the messages table is gaining new columns (media_url, media_type,
// deleted_at, reply_to_id, shared_letter_id, edited_at) in a parallel
// migration. The generated Database types don't include those yet, so we
// cast inserts/updates as `any` here until `database.ts` is regenerated.

type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageWithProfile = Message & {
  // Augmented at runtime — see note above.
  media_url?: string | null;
  media_type?: string | null;
  deleted_at?: string | null;
  profiles: { full_name: string | null } | null;
};

/** Lists all (non-deleted) messages for the signed-in user's family, oldest → newest. */
export function useMessages() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
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
        .is("deleted_at" as any, null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MessageWithProfile[];
    },
    enabled: !!userId,
  });
}

/** Sends a plain-text message in the current user's family chat. */
export function useSendTextMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ body }: { body: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const trimmed = body.trim();
      if (!trimmed) throw new Error("Empty message");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      const familyId = profile?.family_id;
      if (!familyId) throw new Error("No family");

      // Cast as any — new columns (media_type) aren't in generated types yet.
      const { data, error } = await supabase
        .from("messages")
        .insert({
          body: trimmed,
          author_id: user.id,
          family_id: familyId,
          message_type: "text",
          media_type: "text",
        } as any)
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

/**
 * Uploads a local audio file to the `voice-memos` bucket and inserts a
 * voice message row. Storage RLS currently only allows writes under
 * `${user_id}/*` so we use `${user_id}/chat-${ts}.m4a` for now.
 */
export function useSendVoiceMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ uri }: { uri: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      const familyId = profile?.family_id;
      if (!familyId) throw new Error("No family");

      // Read local file → blob and upload.
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = (uri.split(".").pop() || "m4a").toLowerCase();
      const path = `${user.id}/chat-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("voice-memos")
        .upload(path, blob, { contentType: `audio/${ext}` });
      if (uploadError) throw uploadError;

      // Cast as any — new media_url/media_type columns aren't in generated types yet.
      const { data, error } = await supabase
        .from("messages")
        .insert({
          author_id: user.id,
          family_id: familyId,
          message_type: "voice",
          media_type: "voice",
          media_url: path,
        } as any)
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

/** Soft-deletes the user's own message by stamping `deleted_at`. */
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id)
        .eq("author_id", user.id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

/**
 * Subscribes to Supabase Realtime for INSERT/UPDATE events on `messages`
 * filtered to a single family. Invalidates the messages query on each
 * change so the list refetches.
 */
export function useChatRealtime(
  familyId: string | null | undefined,
  options: { enabled?: boolean } = {}
) {
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled || !familyId) return;

    const channel = supabase
      .channel(`messages:family:${familyId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, familyId, queryClient]);
}
