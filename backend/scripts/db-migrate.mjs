import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const baseFiles = ["001_mvp_schema.sql", "003_auth_profiles.sql", "004_social_chat_schema.sql", "005_location_geo.sql"];
const shouldSeed = process.env.DB_SEED === "true";
const files = shouldSeed ? [...baseFiles, "002_mvp_seed.sql"] : baseFiles;

for (const file of files) {
  const sqlPath = path.join(process.cwd(), "db", "migrations", file);
  const sql = await fs.readFile(sqlPath, "utf8");

  const res = await fetch(`${supabaseUrl}/pg/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to apply ${file}: ${res.status} ${body}`);
  }

  console.log(`applied ${file}`);
}
