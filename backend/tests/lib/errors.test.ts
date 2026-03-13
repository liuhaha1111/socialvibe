import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toErrorResponse } from "../../src/lib/errors.js";

describe("toErrorResponse", () => {
  it("formats required zod field errors with field path", () => {
    const schema = z.object({
      title: z.string()
    });

    const result = schema.safeParse({});
    if (result.success) {
      throw new Error("Expected schema parse to fail");
    }

    const response = toErrorResponse(result.error);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("BAD_REQUEST");
    expect(response.body.message).toBe("title is required");
  });
});
