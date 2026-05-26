import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller identity via the user's JWT
    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const userId = user.id;

    // Letters, documents, and families reference auth.users without ON DELETE
    // CASCADE, so we must clear them before removing the auth user. The
    // profile row is removed automatically via the auth.users → profiles
    // cascade defined in the initial schema.
    const { error: lettersErr } = await serviceClient
      .from("letters")
      .delete()
      .eq("author_id", userId);
    if (lettersErr) return json({ error: `letters: ${lettersErr.message}` }, 500);

    const { error: documentsErr } = await serviceClient
      .from("documents")
      .delete()
      .eq("owner_id", userId);
    if (documentsErr)
      return json({ error: `documents: ${documentsErr.message}` }, 500);

    // Owned families — best-effort. Other members will have their family_id
    // dangling, which we null out below.
    const { data: ownedFamilies } = await serviceClient
      .from("families")
      .select("id")
      .eq("owner_id", userId);

    if (ownedFamilies && ownedFamilies.length > 0) {
      const familyIds = ownedFamilies.map((f) => f.id);

      // Detach any profiles still pointing at these families.
      await serviceClient
        .from("profiles")
        .update({ family_id: null })
        .in("family_id", familyIds);

      const { error: famErr } = await serviceClient
        .from("families")
        .delete()
        .eq("owner_id", userId);
      if (famErr) return json({ error: `families: ${famErr.message}` }, 500);
    }

    // Finally, delete the auth user. This cascades to public.profiles via
    // the FK defined in the initial schema migration.
    const { error: deleteErr } = await serviceClient.auth.admin.deleteUser(
      userId
    );
    if (deleteErr)
      return json({ error: `auth.users: ${deleteErr.message}` }, 500);

    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
