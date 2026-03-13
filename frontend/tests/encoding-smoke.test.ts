import fs from "node:fs";
import { describe, expect, it } from "vitest";

const files = ["pages/Create.tsx", "pages/Chat.tsx", "pages/ChatList.tsx", "pages/Profile.tsx", "pages/Settings.tsx"];
const mojibakeMarkers = ["锟", "閸", "濞", "鍙", "鈥"]; 

describe("encoding smoke", () => {
  it("does not contain common mojibake markers in key pages", () => {
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      expect(text.includes("�")).toBe(false);
      for (const marker of mojibakeMarkers) {
        expect(text.includes(marker)).toBe(false);
      }
    }
  });
});
