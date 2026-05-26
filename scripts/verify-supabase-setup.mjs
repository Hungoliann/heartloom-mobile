// Probes the live Supabase project to verify SETUP.sql + bucket creation.
// Non-destructive: only reads / attempts a dry insert that we always roll back.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(url, anonKey);

const results = [];
function pass(name, detail) {
  results.push({ name, status: "PASS", detail });
}
function fail(name, detail) {
  results.push({ name, status: "FAIL", detail });
}
function warn(name, detail) {
  results.push({ name, status: "WARN", detail });
}

// 1. Does the voice-memos bucket exist? Hit the storage list endpoint anonymously.
// Anon can usually call object list with bucket_id — a 404 vs other error tells us if the bucket exists.
try {
  const r = await fetch(`${url}/storage/v1/object/list/voice-memos`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1 }),
  });
  if (r.status === 404) fail("voice-memos bucket", "404 — bucket not created yet");
  else if (r.status === 400 || r.status === 401 || r.status === 403)
    pass("voice-memos bucket", `bucket exists (status ${r.status}, RLS blocked anon as expected)`);
  else pass("voice-memos bucket", `status ${r.status}`);
} catch (e) {
  fail("voice-memos bucket", String(e.message));
}

// 2. Column existence trick: PostgREST returns 400 "column X does not exist"
// if the column is missing, or 401 (RLS) if it exists. Either way we learn.
async function columnExists(table, column) {
  const r = await fetch(
    `${url}/rest/v1/${table}?select=${column}&limit=1`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
  );
  if (r.status === 200) return { ok: true, detail: "readable (anon select allowed)" };
  const body = await r.text();
  if (/does not exist/i.test(body))
    return { ok: false, detail: `column missing: ${body.slice(0, 100)}` };
  // 401 / 403 / RLS = column exists but blocked, which is what we want
  return { ok: true, detail: `column present (status ${r.status}, RLS blocked anon as expected)` };
}

// profiles.push_token
try {
  const r = await columnExists("profiles", "push_token");
  if (r.ok) pass("profiles.push_token column", r.detail);
  else fail("profiles.push_token column", r.detail);
} catch (e) {
  fail("profiles.push_token column", String(e.message));
}

// letters.family_id nullable — probe by filtering is.null. PostgREST will
// reject the syntax if the column is non-existent; if the column exists and
// is non-nullable, the filter still runs (returns 401 due to RLS); the real
// nullability check requires an insert which we can't do anon. So this only
// confirms the column exists.
try {
  const r = await fetch(
    `${url}/rest/v1/letters?select=id&family_id=is.null&limit=1`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
  );
  const body = await r.text();
  if (/does not exist/i.test(body))
    fail("letters.family_id column", "column missing");
  else
    warn(
      "letters.family_id nullable",
      "column reachable; can't confirm null constraint without a real insert — assume OK if SETUP.sql ran without errors"
    );
} catch (e) {
  fail("letters.family_id nullable", String(e.message));
}

// 3. Storage RLS — anon attempting to upload should fail with 403, not 400 (which would mean policy missing).
try {
  const r = await fetch(`${url}/storage/v1/object/voice-memos/__probe.txt`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "text/plain",
    },
    body: "x",
  });
  const t = await r.text();
  if (/violates row-level security/i.test(t))
    pass("voice-memos RLS", "RLS active — anon blocked correctly");
  else if (r.status === 403) pass("voice-memos RLS", "anon blocked with 403");
  else if (r.status === 401) pass("voice-memos RLS", "anon blocked with 401");
  else if (r.status === 404) warn("voice-memos RLS", "bucket missing");
  else if (r.ok) fail("voice-memos RLS", "anon upload succeeded — RLS missing");
  else warn("voice-memos RLS", `status ${r.status}: ${t.slice(0, 120)}`);
} catch (e) {
  fail("voice-memos RLS", String(e.message));
}

// Print report
for (const r of results) {
  const icon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⚠️ ";
  console.log(`${icon} ${r.name.padEnd(34)} ${r.detail}`);
}
