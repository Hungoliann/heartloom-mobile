#!/usr/bin/env node
/**
 * Automated Supabase setup for Heartloom Mobile.
 * Run: node scripts/setup-supabase.js
 *
 * Prerequisites: .env must have EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env");

// ── helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`\n▸ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
  } catch (err) {
    if (!opts.ignoreError) throw err;
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    fs.readFileSync(ENV_FILE, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => l.split("=").map((s) => s.trim()))
  );
}

function saveEnv(vars) {
  const existing = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
  let content = existing;
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) {
      content = content.replace(re, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }
  fs.writeFileSync(ENV_FILE, content.trimStart());
  console.log(`✓ Written to .env`);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Heartloom — Supabase Setup");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Collect env vars if missing
  const env = loadEnv();
  const vars = {};

  if (!env.EXPO_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL.includes("your-project")) {
    console.log("Find these at: https://supabase.com/dashboard → your project → Settings → API\n");
    vars.EXPO_PUBLIC_SUPABASE_URL = await ask("Project URL (https://xxxx.supabase.co): ");
  }

  if (!env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY === "your-anon-key") {
    vars.EXPO_PUBLIC_SUPABASE_ANON_KEY = await ask("Anon public key (eyJ...): ");
  }

  if (Object.keys(vars).length > 0) saveEnv(vars);

  const finalEnv = { ...env, ...vars };
  const projectUrl = finalEnv.EXPO_PUBLIC_SUPABASE_URL;
  // Extract project ref from URL: https://abcdefgh.supabase.co -> abcdefgh
  const projectRef = projectUrl.replace("https://", "").split(".")[0];

  console.log(`\n✓ Project ref: ${projectRef}`);

  // 2. Install Supabase CLI if needed
  try {
    execSync("npx supabase --version", { stdio: "pipe" });
    console.log("✓ Supabase CLI found");
  } catch {
    console.log("Installing Supabase CLI...");
    run("npm install --save-dev supabase --legacy-peer-deps");
  }

  // 3. Login check
  console.log("\nChecking Supabase login...");
  try {
    execSync("npx supabase projects list", { stdio: "pipe" });
    console.log("✓ Already logged in");
  } catch {
    console.log("Opening browser for Supabase login...");
    run("npx supabase login");
  }

  // 4. Link project
  console.log(`\nLinking to project ${projectRef}...`);
  run(`npx supabase link --project-ref ${projectRef}`, { ignoreError: true });

  // 5. Push migrations
  console.log("\nPushing database schema...");
  run("npx supabase db push");

  // 6. Generate TypeScript types
  console.log("\nGenerating TypeScript types...");
  run(`npx supabase gen types typescript --project-id ${projectRef} > src/types/database.ts`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ✓ Setup complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nNext: run `npm start` and scan the QR code with Expo Go.\n");
}

main().catch((err) => {
  console.error("\n✗ Setup failed:", err.message);
  process.exit(1);
});
