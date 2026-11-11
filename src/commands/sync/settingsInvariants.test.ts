import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readClaudeJson(name: string) {
	return JSON.parse(
		readFileSync(resolve(__dirname, "../../../claude", name), "utf8"),
	);
}

const settings = readClaudeJson("settings.json");
const preferences = readClaudeJson("preferences.json");

describe("claude/settings.json invariants", () => {
	it("does not contain assist commands in the allow list", () => {
		const allow: string[] = settings.permissions?.allow ?? [];
		const assistEntries = allow.filter((entry) => /\(assist\b/.test(entry));
		expect(assistEntries).toEqual([]);
	});

	it("ships none of the author preferences", () => {
		for (const key of [
			"autoMemoryEnabled",
			"feedbackDrafts",
			"attribution",
			"env",
		])
			expect(settings).not.toHaveProperty(key);
		expect(settings.permissions?.deny).toBeUndefined();
	});
});

describe("claude/preferences.json invariants", () => {
	it("denies the SendFeedback tool", () => {
		expect(preferences.permissions?.deny ?? []).toContain("SendFeedback");
	});

	it("turns feedback drafts off", () => {
		expect(preferences.feedbackDrafts).toBe("off");
	});
});
