import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ harness: undefined as string | undefined }));

vi.mock("node:fs", () => ({
	existsSync: () => false,
	readFileSync: () => "",
}));
vi.mock("../lib/activeHarness", () => ({
	activeHarness: () => state.harness,
}));
vi.mock("./readCodexRulePerms", () => ({
	readCodexRulePerms: (key: string) =>
		key === "allow" ? ["Bash(git status:*)"] : ["Bash(rm -rf:*)"],
}));

import { readSettingsPerms } from "./readSettingsPerms";

beforeEach(() => {
	state.harness = undefined;
});

describe("readSettingsPerms", () => {
	it("ignores Codex rules outside a Codex harness", () => {
		state.harness = "claude";
		expect(readSettingsPerms("allow")).toEqual([]);
	});

	it("adds Codex rule entries under a Codex harness", () => {
		state.harness = "codex";
		expect(readSettingsPerms("allow")).toEqual(["Bash(git status:*)"]);
		expect(readSettingsPerms("deny")).toEqual(["Bash(rm -rf:*)"]);
	});
});
