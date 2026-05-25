import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { invite_code } = await req.json();
    if (!invite_code) return new Response(JSON.stringify({ error: "invite_code required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Use the anon key to verify auth, service role to write
    const authHeader = req.headers.get("Authorization");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get calling user
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Look up invite
    const { data: invite, error: lookupError } = await serviceClient
      .from("family_invites")
      .select("id, family_id, used_by, expires_at")
      .eq("invite_code", invite_code.toUpperCase())
      .single();

    if (lookupError || !invite) return new Response(JSON.stringify({ error: "Invalid invite code" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (invite.used_by) return new Response(JSON.stringify({ error: "Invite code already used" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (new Date(invite.expires_at) < new Date()) return new Response(JSON.stringify({ error: "Invite code has expired" }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Add user to family
    await serviceClient
      .from("profiles")
      .update({ family_id: invite.family_id })
      .eq("id", user.id);

    // Mark invite as used
    await serviceClient
      .from("family_invites")
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq("id", invite.id);

    return new Response(JSON.stringify({ success: true, family_id: invite.family_id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
