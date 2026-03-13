import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config/env.js";
describe("parseEnv", () => {
    it("throws when required variables are missing", () => {
        expect(() => parseEnv({})).toThrow(/SUPABASE_URL/);
    });
});
