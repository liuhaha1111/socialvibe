import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  TEST_PROFILE_ID: z.string().uuid()
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function parseEnv(raw: NodeJS.ProcessEnv): AppEnv {
  return EnvSchema.parse(raw);
}
