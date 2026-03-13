import { describe, expect, it } from "vitest";

describe("chat schema", () => {
  it("has chat tables and at least 3 profiles", async () => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    expect(url).toBeTruthy();
    expect(key).toBeTruthy();

    const tablesRes = await fetch(`${url}/pg/tables?included_schemas=public`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    expect(tablesRes.ok).toBe(true);
    const tables = (await tablesRes.json()) as Array<{ name: string; schema: string }>;
    const names = tables.filter((t) => t.schema === "public").map((t) => t.name);

    expect(names).toContain("chat_conversations");
    expect(names).toContain("chat_participants");
    expect(names).toContain("chat_messages");
    expect(names).toContain("chat_read_states");

    const queryRes = await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({ query: "select count(*)::int as c from public.profiles;" })
    });
    expect(queryRes.ok).toBe(true);
    const body = (await queryRes.json()) as Array<{ c: number }>;
    expect(body[0].c).toBeGreaterThanOrEqual(3);
  });
});
