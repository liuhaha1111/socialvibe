import { describe, expect, it } from "vitest";
describe("db schema", () => {
    it("has profiles, activities, favorites tables", async () => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        expect(supabaseUrl).toBeTruthy();
        expect(serviceRoleKey).toBeTruthy();
        const res = await fetch(`${supabaseUrl}/pg/tables?included_schemas=public`, {
            headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`
            }
        });
        expect(res.ok).toBe(true);
        const body = (await res.json());
        const publicNames = body
            .filter((x) => x.schema === "public")
            .map((x) => x.name);
        expect(publicNames).toContain("profiles");
        expect(publicNames).toContain("activities");
        expect(publicNames).toContain("favorites");
    });
});
