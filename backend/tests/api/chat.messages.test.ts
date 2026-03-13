import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("chat messages api", () => {
  it("loads, sends, and marks read in a conversation", async () => {
    const conversationsRes = await request(app).get("/api/v1/me/conversations");
    expect(conversationsRes.status).toBe(200);

    const conversationId = conversationsRes.body.data.find((c: { type: string }) => c.type === "direct")
      ?.id as string | undefined;
    expect(conversationId).toBeTypeOf("string");

    const listRes = await request(app).get(`/api/v1/me/conversations/${conversationId}/messages`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const content = `hello-${Date.now()}`;
    const sendRes = await request(app).post(`/api/v1/me/conversations/${conversationId}/messages`).send({ content });
    expect(sendRes.status).toBe(201);
    expect(sendRes.body.data.content).toBe(content);

    const readRes = await request(app).post(`/api/v1/me/conversations/${conversationId}/read`).send({
      last_read_message_id: sendRes.body.data.id
    });
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.last_read_message_id).toBe(sendRes.body.data.id);
  });
});
