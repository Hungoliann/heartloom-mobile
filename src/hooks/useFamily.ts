import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import type { Database } from "../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Family = Database["public"]["Tables"]["families"]["Row"];

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateInviteCode(): string {
  return Array.from({ length: 6 })
    .map(() => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)])
    .join("");
}

/**
 * Existing hook — returns all members in the current user's family.
 * Kept for backwards compatibility with the Family tab member list.
 */
export function useFamily() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["family", userId],
    queryFn: async () => {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", userId!)
        .single();

      if (!myProfile?.family_id) return [];

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

/**
 * Returns the current user's family row (or null if they don't belong to one yet).
 */
export function useMyFamily() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["my-family", userId],
    queryFn: async (): Promise<Family | null> => {
      const { data: myProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", userId!)
        .single();

      if (profileErr) throw profileErr;
      if (!myProfile?.family_id) return null;

      const { data, error } = await supabase
        .from("families")
        .select("*")
        .eq("id", myProfile.family_id)
        .single();

      if (error) throw error;
      return data as Family;
    },
    enabled: !!userId,
  });
}

export function useCreateFamily() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("Not signed in");
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Please enter a family name");

      const { data: family, error: famErr } = await supabase
        .from("families")
        .insert({ name: trimmed, owner_id: userId })
        .select()
        .single();

      if (famErr || !family) throw famErr ?? new Error("Could not create family");

      const { error: profErr } = await supabase
        .from("profiles")
        .update({ family_id: family.id })
        .eq("id", userId);

      if (profErr) throw profErr;

      return family as Family;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-family"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["family"] });
    },
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (familyId: string) => {
      if (!userId) throw new Error("Not signed in");
      const invite_code = generateInviteCode();

      // family_invites is not in generated types yet — cast to any.
      const { data, error } = await (supabase as any)
        .from("family_invites")
        .insert({
          family_id: familyId,
          invite_code,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        // Unique-constraint violation or other — surface a generic retry message.
        throw new Error("Could not generate code. Try again.");
      }
      return data as { invite_code: string; family_id: string; expires_at: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-family"] });
    },
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (rawCode: string) => {
      if (!userId) throw new Error("Not signed in");
      const code = rawCode.trim().toUpperCase();
      if (!code) throw new Error("Please enter an invite code");

      // 1. Look up the invite.
      const { data: invite, error: lookupErr } = await (supabase as any)
        .from("family_invites")
        .select("id, family_id, used_by, used_at, expires_at")
        .eq("invite_code", code)
        .maybeSingle();

      if (lookupErr) throw new Error("Could not check code. Try again.");
      if (!invite) throw new Error("Invalid invite code");

      if (invite.used_by || invite.used_at) {
        throw new Error("This code has already been used");
      }
      if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
        throw new Error("This code has expired");
      }

      // 2. Mark the invite used (RLS allows update when used_by is null).
      const { error: updateErr } = await (supabase as any)
        .from("family_invites")
        .update({ used_by: userId, used_at: new Date().toISOString() })
        .eq("id", invite.id);

      if (updateErr) throw new Error("Could not redeem code. Try again.");

      // 3. Attach the user to the family.
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ family_id: invite.family_id })
        .eq("id", userId);

      if (profErr) throw profErr;

      return { family_id: invite.family_id as string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-family"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["family"] });
    },
  });
}
