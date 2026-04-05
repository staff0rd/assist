import { beforeEach, describe, expect, it, vi } from "vitest";
import { _resetCaches, matchesAllow, matchesDeny } from "./matchesAllow";

let perms: { allow: string[]; deny: string[] } = { allow: [], deny: [] };

vi.mock("./readSettingsPerms", () => ({
	readSettingsPerms: (key: "allow" | "deny") => perms[key],
}));

function setup(allow: string[] = [], deny: string[] = []) {
	perms = { allow, deny };
	_resetCaches();
}

beforeEach(() => {
	perms = { allow: [], deny: [] };
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

	it("should match entry without colon suffix (exact command)", () => {
		setup(["Bash(assist run test)"]);
		expect(matchesAllow("Bash", "assist run test")).toBe("assist run test");
	});

	it("should not match entry without colon suffix when arguments present", () => {
		setup(["Bash(assist run test)"]);
		expect(matchesAllow("Bash", "assist run test --verbose")).toBeUndefined();
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

	it("should match ./command against command entry", () => {
		setup(["PowerShell(build.ps1:*)"]);
		expect(matchesAllow("PowerShell", "./build.ps1 -Target Test")).toBe(
			"build.ps1",
		);
	});

	it("should match command against ./command entry", () => {
		setup(["PowerShell(./build.ps1:*)"]);
		expect(matchesAllow("PowerShell", "build.ps1 -Target Test")).toBe(
			"build.ps1",
		);
	});

	it("should match .\\command against command entry (Windows)", () => {
		setup(["Bash(build.ps1:*)"]);
		expect(matchesAllow("Bash", ".\\build.ps1 -Target Test")).toBe("build.ps1");
	});

	it("should match exact ./command against command entry", () => {
		setup(["PowerShell(build.ps1)"]);
		expect(matchesAllow("PowerShell", "./build.ps1")).toBe("build.ps1");
	});

	it("should match command against entry with 2>&1 redirect suffix", () => {
		setup(["Bash(./build.sh 2>&1)"]);
		expect(matchesAllow("Bash", "./build.sh")).toBe("build.sh");
	});

	it("should match command without ./ against entry with ./ and 2>&1", () => {
		setup(["Bash(./build.sh 2>&1)"]);
		expect(matchesAllow("Bash", "build.sh")).toBe("build.sh");
	});

	it("should match command against entry with 2>/dev/null suffix", () => {
		setup(["Bash(./build.sh 2>/dev/null)"]);
		expect(matchesAllow("Bash", "build.sh")).toBe("build.sh");
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
