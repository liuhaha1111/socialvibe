import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const files = [
  "001_mvp_schema.sql",
  "002_mvp_seed.sql",
  "003_chat_schema.sql",
  "004_chat_seed.sql"
];

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
