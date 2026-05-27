import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

// NOTE: Generated types not yet refreshed — the messages table is gaining new
// columns (media_url, media_type, deleted_at, reply_to_id, shared_letter_id,
// edited_at, duration_ms) and a sibling `message_reactions` table exists. We
// cast inserts/updates as `any` here until `database.ts` is regenerated.

type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageReaction = {
  emoji: string;
  user_id: string;
};
export type MessageWithProfile = Message & {
  // Augmented at runtime — see note above.
  media_url?: string | null;
  media_type?: string | null;
  deleted_at?: string | null;
  reply_to_id?: string | null;
  shared_letter_id?: string | null;
  duration_ms?: number | null;
  edited_at?: string | null;
  profiles: { full_name: string | null } | null;
  message_reactions?: MessageReaction[];
  /** Optimistic flag — true while the row is local-only awaiting realtime confirmation. */
  pending?: boolean;
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

      // Generated types not yet refreshed — message_reactions join is runtime-valid.
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles(full_name), message_reactions(emoji, user_id)" as any)
        .eq("family_id", familyId)
        .is("deleted_at" as any, null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MessageWithProfile[];
    },
    enabled: !!userId,
  });
}

async function fetchFamilyId(userId: string): Promise<string> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const familyId = profile?.family_id;
  if (!familyId) throw new Error("No family");
  return familyId;
}

function makeTempMessage(args: {
  user: { id: string; name?: string | null };
  familyId: string;
  body: string | null;
  mediaType: "text" | "voice" | "shared_letter";
  mediaUrl?: string | null;
  durationMs?: number | null;
  sharedLetterId?: string | null;
  replyToId?: string | null;
}): MessageWithProfile {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author_id: args.user.id,
    family_id: args.familyId,
    body: args.body,
    created_at: new Date().toISOString(),
    message_type: args.mediaType,
    media_type: args.mediaType,
    media_url: args.mediaUrl ?? null,
    duration_ms: args.durationMs ?? null,
    shared_letter_id: args.sharedLetterId ?? null,
    reply_to_id: args.replyToId ?? null,
    deleted_at: null,
    edited_at: null,
    profiles: { full_name: args.user.name ?? null },
    message_reactions: [],
    pending: true,
  } as unknown as MessageWithProfile;
}

/** Sends a plain-text message in the current user's family chat. */
export function useSendTextMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      body,
      replyToId,
    }: {
      body: string;
      replyToId?: string | null;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const trimmed = body.trim();
      if (!trimmed) throw new Error("Empty message");

      const familyId = await fetchFamilyId(user.id);

      const { data, error } = await supabase
        .from("messages")
        .insert({
          body: trimmed,
          author_id: user.id,
          family_id: familyId,
          message_type: "text",
          media_type: "text",
          reply_to_id: replyToId ?? null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onMutate: async ({ body, replyToId }) => {
      if (!user?.id) return;
      const trimmed = body.trim();
      if (!trimmed) return;

      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const previous = queryClient.getQueryData<MessageWithProfile[]>([
        "messages",
        user.id,
      ]);
      // Best-effort: we don't block on family lookup here. Use most-recent
      // message's family_id as a placeholder if available; the temp row only
      // needs to look right in the local cache.
      const familyId =
        previous?.[previous.length - 1]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: { id: user.id, name: (user as any).user_metadata?.full_name ?? null },
        familyId,
        body: trimmed,
        mediaType: "text",
        replyToId: replyToId ?? null,
      });
      queryClient.setQueryData<MessageWithProfile[]>(
        ["messages", user.id],
        (old) => [...(old ?? []), temp]
      );
      return { tempId: temp.id, previous };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      queryClient.setQueryData<MessageWithProfile[]>(
        ["messages", user.id],
        (old) => (old ?? []).filter((m) => m.id !== ctx.tempId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

/**
 * Uploads a local audio file to the `voice-memos` bucket and inserts a
 * voice message row.
 */
export function useSendVoiceMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      uri,
      replyToId,
      durationMs,
    }: {
      uri: string;
      replyToId?: string | null;
      durationMs?: number | null;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const familyId = await fetchFamilyId(user.id);

      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = (uri.split(".").pop() || "m4a").toLowerCase();
      const path = `${user.id}/chat-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("voice-memos")
        .upload(path, blob, { contentType: `audio/${ext}` });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("messages")
        .insert({
          author_id: user.id,
          family_id: familyId,
          message_type: "voice",
          media_type: "voice",
          media_url: path,
          duration_ms: durationMs ?? null,
          reply_to_id: replyToId ?? null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onMutate: async ({ replyToId, durationMs }) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const previous = queryClient.getQueryData<MessageWithProfile[]>([
        "messages",
        user.id,
      ]);
      const familyId =
        previous?.[previous.length - 1]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: { id: user.id, name: (user as any).user_metadata?.full_name ?? null },
        familyId,
        body: null,
        mediaType: "voice",
        mediaUrl: null, // signed URL won't resolve; bubble will show pending until refetch
        durationMs: durationMs ?? null,
        replyToId: replyToId ?? null,
      });
      queryClient.setQueryData<MessageWithProfile[]>(
        ["messages", user.id],
        (old) => [...(old ?? []), temp]
      );
      return { tempId: temp.id, previous };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      queryClient.setQueryData<MessageWithProfile[]>(
        ["messages", user.id],
        (old) => (old ?? []).filter((m) => m.id !== ctx.tempId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

/** Sends a "shared letter" chat card referencing one of the user's letters. */
export function useSendSharedLetter() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      letterId,
      replyToId,
    }: {
      letterId: string;
      replyToId?: string | null;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const familyId = await fetchFamilyId(user.id);

      const { data, error } = await supabase
        .from("messages")
        .insert({
          author_id: user.id,
          family_id: familyId,
          body: null,
          message_type: "shared_letter",
          media_type: "shared_letter",
          shared_letter_id: letterId,
          reply_to_id: replyToId ?? null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onMutate: async ({ letterId, replyToId }) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const previous = queryClient.getQueryData<MessageWithProfile[]>([
        "messages",
        user.id,
      ]);
      const familyId =
        previous?.[previous.length - 1]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: { id: user.id, name: (user as any).user_metadata?.full_name ?? null },
        familyId,
        body: null,
        mediaType: "shared_letter",
        sharedLetterId: letterId,
        replyToId: replyToId ?? null,
      });
      queryClient.setQueryData<MessageWithProfile[]>(
        ["messages", user.id],
        (old) => [...(old ?? []), temp]
      );
      return { tempId: temp.id, previous };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      queryClient.setQueryData<MessageWithProfile[]>(
        ["messages", user.id],
        (old) => (old ?? []).filter((m) => m.id !== ctx.tempId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

/** Toggles a reaction (emoji) on a message for the current user. */
export function useToggleReaction() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check whether this user already reacted with this emoji on this message.
      const { data: existing, error: selectError } = await (supabase as any)
        .from("message_reactions")
        .select("message_id")
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji)
        .maybeSingle();
      if (selectError) throw selectError;

      if (existing) {
        const { error } = await (supabase as any)
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", user.id)
          .eq("emoji", emoji);
        if (error) throw error;
        return { messageId, emoji, toggled: "off" as const };
      }

      const { error } = await (supabase as any)
        .from("message_reactions")
        .insert({ message_id: messageId, user_id: user.id, emoji });
      if (error) throw error;
      return { messageId, emoji, toggled: "on" as const };
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
 * (filtered by family) AND INSERT/DELETE events on `message_reactions`.
 *
 * Why no family filter on `message_reactions`: Realtime postgres_changes filters
 * only support columns on the changed row itself, and message_reactions has no
 * `family_id` column — a server-side join would be required to scope by family.
 * RLS on message_reactions already restricts this subscription to rows the
 * current user is allowed to see (their own family), so subscribing without a
 * filter is safe and cheap. On any reaction change we invalidate ["messages"]
 * so the joined `message_reactions` data in each message refetches.
 */
export function useChatRealtime(
  familyId: string | null | undefined,
  options: { enabled?: boolean } = {}
) {
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled || !familyId) return;

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ["messages"] });

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
        invalidate
      )
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `family_id=eq.${familyId}`,
        },
        invalidate
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "message_reactions" },
        invalidate
      )
      .on(
        "postgres_changes" as any,
        { event: "DELETE", schema: "public", table: "message_reactions" },
        invalidate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, familyId, queryClient]);
}
