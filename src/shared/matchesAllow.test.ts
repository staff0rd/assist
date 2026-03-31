import { beforeEach, describe, expect, it, vi } from "vitest";
import { _resetCaches, matchesAllow, matchesDeny } from "./matchesAllow";

let settingsJson = "{}";

vi.mock("node:os", () => ({
	homedir: () => "/fake-home",
}));

vi.mock("node:fs", () => ({
	existsSync: (p: string) => {
		const norm = p.replace(/\\/g, "/");
		return (
			norm.includes(".claude/settings.json") &&
			!norm.includes("fake-home") &&
			!norm.includes("local")
		);
	},
	readFileSync: () => settingsJson,
}));

function setup(allow: string[] = [], deny: string[] = []) {
	settingsJson = JSON.stringify({ permissions: { allow, deny } });
	_resetCaches();
}

beforeEach(() => {
	settingsJson = "{}";
	_resetCaches();
});

describe("matchesAllow", () => {
	it("should match a Bash entry when tool is Bash", () => {
		setup(["Bash(assist verify:*)"]);
		expect(matchesAllow("Bash", "assist verify")).toBe("assist verify");
	});

	it("should match a Bash entry when tool is PowerShell (cross-tool)", () => {
		setup(["Bash(assist verify:*)"]);
		expect(matchesAllow("PowerShell", "assist verify")).toBe("assist verify");
	});

	it("should match a PowerShell entry when tool is Bash (cross-tool)", () => {
		setup(["PowerShell(assist verify:*)"]);
		expect(matchesAllow("Bash", "assist verify")).toBe("assist verify");
	});

	it("should not match an unrelated command", () => {
		setup(["Bash(assist verify:*)"]);
		expect(matchesAllow("Bash", "rm -rf /")).toBeUndefined();
	});

	it("should match prefix with arguments", () => {
		setup(["Bash(assist backlog comment:*)"]);
		expect(
			matchesAllow("PowerShell", 'assist backlog comment 34 "hello"'),
		).toBe("assist backlog comment");
	});
});

describe("matchesDeny", () => {
	it("should match a Bash deny entry when tool is Bash", () => {
		setup([], ["Bash(git commit:*)"]);
		expect(matchesDeny("Bash", "git commit -m test")).toBe("git commit");
	});

	it("should match a Bash deny entry when tool is PowerShell (cross-tool)", () => {
		setup([], ["Bash(git commit:*)"]);
		expect(matchesDeny("PowerShell", "git commit -m test")).toBe("git commit");
	});

	it("should not match an unrelated command", () => {
		setup([], ["Bash(git commit:*)"]);
		expect(matchesDeny("Bash", "git log")).toBeUndefined();
	});
});
