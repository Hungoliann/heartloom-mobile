import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import { useFamily } from "./useFamily";
import type { Database } from "../types/database";

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Maps a raw error into friendlier, user-facing text. Network-style failures
 * get a connection hint; everything else falls through to the original message.
 */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/network|fetch|timeout|offline|connection/i.test(msg)) {
    return "You appear to be offline. Check your connection and try again.";
  }
  return msg;
}

// NOTE: Generated types not yet refreshed — the messages table is gaining new
// columns (media_url, media_type, deleted_at, reply_to_id, shared_letter_id,
// edited_at, duration_ms), a sibling `message_reactions` table exists, and the
// `message_reads` table is new. Casts to `any` are localized here until
// `database.ts` is regenerated.

type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageReaction = {
  emoji: string;
  user_id: string;
};
export type MessageMention = {
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
  pinned_at?: string | null;
  profiles: { full_name: string | null } | null;
  message_reactions?: MessageReaction[];
  message_mentions?: MessageMention[];
  /** Optimistic flag — true while the row is local-only awaiting realtime confirmation. */
  pending?: boolean;
};

const PAGE_SIZE = 50;

type Page = {
  rows: MessageWithProfile[];
  /** ISO `created_at` cursor to pass as `lt=` for the next (older) page. */
  nextCursor: string | null;
};

type MessagesInfinite = InfiniteData<Page, string | null>;

function messagesKey(userId: string | undefined) {
  return ["messages", userId] as const;
}

/**
 * Paginated messages for the signed-in user's family.
 *
 * Pages are ordered created_at DESC and use the oldest `created_at` of the
 * previous page as a `lt=` cursor for the next (older) page. We flatten + sort
 * ASCENDING for rendering so the caller doesn't have to think about the
 * descending page boundary.
 */
export function useMessages() {
  const userId = useAuthStore((s) => s.user?.id);

  const familyQuery = useQuery({
    queryKey: ["profile-family-id", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data?.family_id as string | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const q = useInfiniteQuery<
    Page,
    Error,
    MessagesInfinite,
    readonly unknown[],
    string | null
  >({
    queryKey: messagesKey(userId),
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const familyId = familyQuery.data;
      if (!familyId) return { rows: [], nextCursor: null };

      let query = supabase
        .from("messages")
        .select(
          "*, profiles(full_name), message_reactions(emoji, user_id), message_mentions(user_id)" as any
        )
        .eq("family_id", familyId)
        .is("deleted_at" as any, null)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = (data ?? []) as unknown as MessageWithProfile[];
      const nextCursor =
        rows.length === PAGE_SIZE ? rows[rows.length - 1].created_at : null;
      return { rows, nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!userId && !!familyQuery.data,
  });

  const messages = useMemo<MessageWithProfile[]>(() => {
    const all: MessageWithProfile[] = [];
    for (const p of q.data?.pages ?? []) all.push(...p.rows);
    // Dedup by id (optimistic temp + realtime row could coexist briefly).
    const seen = new Set<string>();
    const dedup: MessageWithProfile[] = [];
    for (const m of all) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      dedup.push(m);
    }
    dedup.sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime()
    );
    return dedup;
  }, [q.data]);

  return {
    messages,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isFetchingNextPage: q.isFetchingNextPage,
    hasNextPage: q.hasNextPage,
    fetchNextPage: q.fetchNextPage,
    refetch: q.refetch,
  };
}

async function insertMentions(messageId: string, userIds: string[] | undefined) {
  if (!userIds || userIds.length === 0) return;
  const unique = Array.from(new Set(userIds));
  const rows = unique.map((user_id) => ({ message_id: messageId, user_id }));
  const { error } = await (supabase as any)
    .from("message_mentions")
    .insert(rows);
  if (error) {
    // Best-effort: log and continue. Message already saved.
    // eslint-disable-next-line no-console
    console.warn("Failed to insert message_mentions:", error.message);
  }
}

let _cachedFamilyId: { userId: string; familyId: string; ts: number } | null = null;

async function fetchFamilyId(userId: string): Promise<string> {
  if (_cachedFamilyId && _cachedFamilyId.userId === userId && Date.now() - _cachedFamilyId.ts < 5 * 60 * 1000) {
    return _cachedFamilyId.familyId;
  }
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const familyId = profile?.family_id;
  if (!familyId) throw new Error("No family");
  _cachedFamilyId = { userId, familyId, ts: Date.now() };
  return familyId;
}

function makeTempMessage(args: {
  user: { id: string; name?: string | null };
  familyId: string;
  body: string | null;
  mediaType: "text" | "voice" | "shared_letter" | "image";
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

/** Push an optimistic temp row onto the newest page (pages[0]) of the infinite cache. */
function pushOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  temp: MessageWithProfile
) {
  queryClient.setQueryData<MessagesInfinite>(messagesKey(userId), (old) => {
    if (!old || old.pages.length === 0) {
      return {
        pages: [{ rows: [temp], nextCursor: null }],
        pageParams: [null],
      };
    }
    // Newest page is pages[0] (DESC order). Prepend so it shows up first.
    const [first, ...rest] = old.pages;
    return {
      ...old,
      pages: [{ ...first, rows: [temp, ...first.rows] }, ...rest],
    };
  });
}

/** Drop a temp row by id across all pages (for onError rollback). */
function dropOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  tempId: string
) {
  queryClient.setQueryData<MessagesInfinite>(messagesKey(userId), (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        rows: p.rows.filter((r) => r.id !== tempId),
      })),
    };
  });
}

/** Sends a plain-text message in the current user's family chat. */
export function useSendTextMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      body,
      replyToId,
      mentionedUserIds,
    }: {
      body: string;
      replyToId?: string | null;
      mentionedUserIds?: string[];
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
      await insertMentions((data as any).id, mentionedUserIds);
      return data as Message;
    },
    onMutate: async ({ body, replyToId }) => {
      if (!user?.id) return;
      const trimmed = body.trim();
      if (!trimmed) return;

      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const existing = queryClient.getQueryData<MessagesInfinite>(
        messagesKey(user.id)
      );
      const familyId =
        existing?.pages?.[0]?.rows?.[0]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: {
          id: user.id,
          name: (user as any).user_metadata?.full_name ?? null,
        },
        familyId,
        body: trimmed,
        mediaType: "text",
        replyToId: replyToId ?? null,
      });
      pushOptimistic(queryClient, user.id, temp);
      return { tempId: temp.id };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      dropOptimistic(queryClient, user.id, ctx.tempId);
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
      mentionedUserIds,
    }: {
      uri: string;
      replyToId?: string | null;
      durationMs?: number | null;
      mentionedUserIds?: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const familyId = await fetchFamilyId(user.id);

      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = (uri.split(".").pop() || "m4a").toLowerCase();
      const path = `${user.id}/chat-${uniqueId()}.${ext}`;

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
      await insertMentions((data as any).id, mentionedUserIds);
      return data as Message;
    },
    onMutate: async ({ replyToId, durationMs }) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const existing = queryClient.getQueryData<MessagesInfinite>(
        messagesKey(user.id)
      );
      const familyId =
        existing?.pages?.[0]?.rows?.[0]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: {
          id: user.id,
          name: (user as any).user_metadata?.full_name ?? null,
        },
        familyId,
        body: null,
        mediaType: "voice",
        mediaUrl: null,
        durationMs: durationMs ?? null,
        replyToId: replyToId ?? null,
      });
      pushOptimistic(queryClient, user.id, temp);
      return { tempId: temp.id };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      dropOptimistic(queryClient, user.id, ctx.tempId);
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
      mentionedUserIds,
    }: {
      letterId: string;
      replyToId?: string | null;
      mentionedUserIds?: string[];
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
      await insertMentions((data as any).id, mentionedUserIds);
      return data as Message;
    },
    onMutate: async ({ letterId, replyToId }) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const existing = queryClient.getQueryData<MessagesInfinite>(
        messagesKey(user.id)
      );
      const familyId =
        existing?.pages?.[0]?.rows?.[0]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: {
          id: user.id,
          name: (user as any).user_metadata?.full_name ?? null,
        },
        familyId,
        body: null,
        mediaType: "shared_letter",
        sharedLetterId: letterId,
        replyToId: replyToId ?? null,
      });
      pushOptimistic(queryClient, user.id, temp);
      return { tempId: temp.id };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      dropOptimistic(queryClient, user.id, ctx.tempId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

/**
 * Uploads an image file (from camera roll / camera) to the `chat-images`
 * storage bucket and inserts a message row with media_type='image'.
 */
export function useSendImageMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      uri,
      replyToId,
      mentionedUserIds,
    }: {
      uri: string;
      replyToId?: string | null;
      mentionedUserIds?: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const familyId = await fetchFamilyId(user.id);

      const response = await fetch(uri);
      const blob = await response.blob();
      // Trust the source extension; default to jpg.
      const rawExt = (uri.split(".").pop() || "jpg")
        .toLowerCase()
        .split("?")[0]
        .slice(0, 5);
      const ext = ["jpg", "jpeg", "png", "heic", "webp"].includes(rawExt)
        ? rawExt
        : "jpg";
      const contentType = ext === "png" ? "image/png" : `image/${ext === "jpg" ? "jpeg" : ext}`;
      const path = `${user.id}/chat-${uniqueId()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(path, blob, { contentType });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("messages")
        .insert({
          author_id: user.id,
          family_id: familyId,
          // `image` is not yet in generated message_type/media_type enums.
          message_type: "image",
          media_type: "image",
          media_url: path,
          reply_to_id: replyToId ?? null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      await insertMentions((data as any).id, mentionedUserIds);
      return data as Message;
    },
    onMutate: async ({ uri, replyToId }) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      const existing = queryClient.getQueryData<MessagesInfinite>(
        messagesKey(user.id)
      );
      const familyId =
        existing?.pages?.[0]?.rows?.[0]?.family_id ?? "pending";
      const temp = makeTempMessage({
        user: {
          id: user.id,
          name: (user as any).user_metadata?.full_name ?? null,
        },
        familyId,
        body: null,
        mediaType: "image" as any,
        // The local file URI works as an `<Image source>` for the optimistic
        // preview; ImageMessageBubble falls back to it when no signed URL.
        mediaUrl: uri,
        replyToId: replyToId ?? null,
      });
      pushOptimistic(queryClient, user.id, temp);
      return { tempId: temp.id };
    },
    onError: (_err, _vars, ctx) => {
      if (!user?.id || !ctx?.tempId) return;
      dropOptimistic(queryClient, user.id, ctx.tempId);
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

      // Delete-first approach: avoids the select-then-mutate race condition.
      // Two concurrent deletes are safe (one no-ops). Two concurrent inserts
      // after delete: one succeeds, the other hits the unique constraint and
      // is caught below.
      const { data: deleted } = await (supabase as any)
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji)
        .select("message_id");

      if (deleted && deleted.length > 0) {
        return { messageId, emoji, toggled: "off" as const };
      }

      // Nothing was deleted — reaction didn't exist, so insert it.
      try {
        const { error } = await (supabase as any)
          .from("message_reactions")
          .insert({ message_id: messageId, user_id: user.id, emoji });
        if (error) {
          // Unique constraint violation (code 23505) means a concurrent
          // request already inserted — treat as "already toggled on".
          if (error.code === "23505") {
            return { messageId, emoji, toggled: "on" as const };
          }
          throw error;
        }
      } catch (err: any) {
        // Also guard against the constraint error surfacing as an exception
        if (err?.code === "23505") {
          return { messageId, emoji, toggled: "on" as const };
        }
        throw err;
      }
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
 * Returns an internally-throttled `markAsRead()` function. Upserts the
 * current user's `message_reads.last_read_at` to `now()` for the given
 * family — but only at most once every 2 seconds.
 *
 * `message_reads` is not in the generated DB types yet (cast as any).
 */
export function useMarkAsRead(familyId: string | null | undefined) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const lastFiredRef = useRef<number>(0);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async () => {
    if (!user?.id || !familyId) return;
    lastFiredRef.current = Date.now();
    const { error } = await (supabase as any)
      .from("message_reads")
      .upsert(
        {
          family_id: familyId,
          user_id: user.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "family_id,user_id" }
      );
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["family-reads", familyId] });
    }
  }, [user?.id, familyId, queryClient]);

  const markAsRead = useCallback(() => {
    if (!user?.id || !familyId) return;
    const now = Date.now();
    const since = now - lastFiredRef.current;
    if (since >= 2000) {
      run();
    } else if (!pendingTimeoutRef.current) {
      // Trailing edge: schedule a single fire at the next window boundary.
      pendingTimeoutRef.current = setTimeout(() => {
        pendingTimeoutRef.current = null;
        run();
      }, 2000 - since);
    }
  }, [user?.id, familyId, run]);

  useEffect(
    () => () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
    },
    []
  );

  return markAsRead;
}

export type FamilyRead = {
  user_id: string;
  last_read_at: string;
};

/** Returns last_read_at for every member of the given family. */
export function useFamilyReads(familyId: string | null | undefined) {
  return useQuery<FamilyRead[]>({
    queryKey: ["family-reads", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await (supabase as any)
        .from("message_reads")
        .select("user_id, last_read_at")
        .eq("family_id", familyId);
      if (error) throw error;
      return (data ?? []) as FamilyRead[];
    },
    enabled: !!familyId,
  });
}

export type TypingUser = {
  user_id: string;
  full_name: string;
};

/**
 * Supabase Realtime presence for the chat room. Returns:
 *   - typingUsers (excluding the current user)
 *   - startTyping() — call on input change; tracks `typing: true` and schedules
 *     a `stopTyping()` after 3s of no activity. Throttled so we only call
 *     `track` once per second while typing.
 *   - stopTyping() — call on send/blur; tracks `typing: false` immediately.
 *   - onlineUserIds — every key currently present in the channel.
 */
export function useChatPresence(familyId: string | null | undefined) {
  const user = useAuthStore((s) => s.user);
  const { data: members } = useFamily();
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTrackRef = useRef<number>(0);
  const isTypingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!familyId || !user?.id) return;

    const channel = supabase.channel(`chat-presence-${familyId}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel.on("presence" as any, { event: "sync" }, () => {
      const state = (channel as any).presenceState() as Record<
        string,
        Array<{ typing?: boolean }>
      >;
      const online: string[] = [];
      const typing: string[] = [];
      for (const [uid, metas] of Object.entries(state)) {
        online.push(uid);
        const latest = metas[metas.length - 1];
        if (latest?.typing) typing.push(uid);
      }
      setOnlineUserIds(online);
      setTypingUserIds(typing);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await (channel as any).track({ typing: false });
      }
    });

    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      try {
        (channel as any).untrack?.();
      } catch {
        // ignore
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
      isTypingRef.current = false;
    };
  }, [familyId, user?.id]);

  const startTyping = useCallback(() => {
    const ch = channelRef.current;
    if (!ch) return;
    const now = Date.now();
    // Throttle track calls — at most once per second while typing.
    if (!isTypingRef.current || now - lastTrackRef.current > 1000) {
      isTypingRef.current = true;
      lastTrackRef.current = now;
      (ch as any).track({ typing: true });
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      stopTimerRef.current = null;
      const c = channelRef.current;
      if (!c) return;
      isTypingRef.current = false;
      (c as any).track({ typing: false });
    }, 3000);
  }, []);

  const stopTyping = useCallback(() => {
    const ch = channelRef.current;
    if (!ch) return;
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      (ch as any).track({ typing: false });
    }
  }, []);

  const typingUsers = useMemo<TypingUser[]>(() => {
    if (!members) return [];
    return typingUserIds
      .filter((id) => id !== user?.id)
      .map((id) => {
        const m = members.find((p) => p.id === id);
        return {
          user_id: id,
          full_name: m?.full_name ?? "Someone",
        };
      });
  }, [typingUserIds, members, user?.id]);

  return { typingUsers, startTyping, stopTyping, onlineUserIds };
}

/**
 * Full-text search across the user's family messages. Debounced via the
 * caller (we just gate with `enabled` on a non-empty trimmed query).
 */
export function useSearchMessages(
  familyId: string | null | undefined,
  query: string
) {
  const trimmed = query.trim();
  return useQuery<MessageWithProfile[]>({
    queryKey: ["messages-search", familyId, trimmed],
    queryFn: async () => {
      if (!familyId || !trimmed) return [];
      const { data, error } = await (supabase as any)
        .from("messages")
        .select("*, profiles(full_name)")
        .eq("family_id", familyId)
        .is("deleted_at", null)
        .textSearch("body_tsv", trimmed, { type: "plain", config: "simple" })
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as MessageWithProfile[];
    },
    enabled: !!familyId && trimmed.length >= 2,
  });
}

/** Toggles `pinned_at` on a message between null and now(). */
export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      currentlyPinned,
    }: {
      id: string;
      currentlyPinned: boolean;
    }) => {
      const { error } = await supabase
        .from("messages")
        .update({
          pinned_at: currentlyPinned ? null : new Date().toISOString(),
        } as any)
        .eq("id", id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messages-pinned"] });
    },
  });
}

/** Pinned messages for a family (max 5, newest pin first). */
export function usePinnedMessages(familyId: string | null | undefined) {
  return useQuery<MessageWithProfile[]>({
    queryKey: ["messages-pinned", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await (supabase as any)
        .from("messages")
        .select("*, profiles(full_name)")
        .eq("family_id", familyId)
        .is("deleted_at", null)
        .not("pinned_at", "is", null)
        .order("pinned_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as MessageWithProfile[];
    },
    enabled: !!familyId,
  });
}

/**
 * Subscribes to Supabase Realtime for INSERT/UPDATE events on `messages`
 * (filtered by family) AND INSERT/DELETE events on `message_reactions`,
 * plus changes to `message_reads`.
 */
export function useChatRealtime(
  familyId: string | null | undefined,
  options: { enabled?: boolean } = {}
) {
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled || !familyId) return;

    // Debounce invalidation — batch rapid realtime events into a single refetch
    let invalidateTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedInvalidate = (key: readonly unknown[]) => {
      if (invalidateTimer) clearTimeout(invalidateTimer);
      invalidateTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: key });
        invalidateTimer = null;
      }, 300);
    };

    const invalidateMessages = () => debouncedInvalidate(["messages"]);
    const invalidateReads = () =>
      queryClient.invalidateQueries({ queryKey: ["family-reads", familyId] });

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
        invalidateMessages
      )
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `family_id=eq.${familyId}`,
        },
        invalidateMessages
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "message_reactions" },
        invalidateMessages
      )
      .on(
        "postgres_changes" as any,
        { event: "DELETE", schema: "public", table: "message_reactions" },
        invalidateMessages
      )
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "message_reads",
          filter: `family_id=eq.${familyId}`,
        },
        invalidateReads
      )
      .subscribe();

    return () => {
      if (invalidateTimer) clearTimeout(invalidateTimer);
      supabase.removeChannel(channel);
    };
  }, [enabled, familyId, queryClient]);
}
