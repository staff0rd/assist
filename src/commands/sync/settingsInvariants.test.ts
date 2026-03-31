import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const settingsPath = resolve(__dirname, "../../../claude/settings.json");
const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));

describe("claude/settings.json invariants", () => {
	it("does not contain assist commands in the allow list", () => {
		const allow: string[] = settings.permissions?.allow ?? [];
		const assistEntries = allow.filter((entry) => /\(assist\b/.test(entry));
		expect(assistEntries).toEqual([]);
	});
});
