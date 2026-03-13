import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20)
});

export type AppEnv = z.infer<typeof EnvSchema>;

let envFileLoaded = false;

function loadLocalEnvFile() {
  if (envFileLoaded) {
    return;
  }
  envFileLoaded = true;

  const loadEnvFile = (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }).loadEnvFile;
  if (typeof loadEnvFile !== "function") {
    return;
  }

  const candidates = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "backend/.env")];
  const envPath = candidates.find((path) => existsSync(path));
  if (!envPath) {
    return;
  }

  loadEnvFile(envPath);
}

export function parseEnv(raw: NodeJS.ProcessEnv): AppEnv {
  loadLocalEnvFile();
  return EnvSchema.parse(raw);
}
