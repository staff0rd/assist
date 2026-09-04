import { describe, expect, it } from "vitest";
import {
	findRestrictedPathDeny,
	findRestrictedPathDenyRaw,
} from "./findRestrictedPathDeny";

describe("findRestrictedPathDeny read binaries", () => {
	it.each([
		"cat ~/.assist/restricted/notes.md",
		"ls -la ~/.assist/restricted/",
		"grep -r secret ~/.assist/restricted",
		"head -20 ~/.assist/restricted/notes.md",
		"tail -f ~/.assist/restricted/log.txt",
	])("denies %s", (command) => {
		const decision = findRestrictedPathDeny([command]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(".assist/restricted");
	});
});

describe("findRestrictedPathDeny path spellings", () => {
	it.each([
		"cat ~/.assist/restricted/notes.md",
		"cat $HOME/.assist/restricted/notes.md",
		"cat /home/stafford/.assist/restricted/notes.md",
		"cat .assist/restricted/notes.md",
		"cat ../.assist/restricted/notes.md",
		String.raw`cat C:\Users\stafford\.assist\restricted\notes.md`,
	])("denies %s", (command) => {
		expect(findRestrictedPathDeny([command])?.permissionDecision).toBe("deny");
	});

	it("denies the directory itself with no trailing path", () => {
		expect(findRestrictedPathDeny(["ls ~/.assist/restricted"])).toBeDefined();
	});

	it("denies a part buried in a compound command", () => {
		const decision = findRestrictedPathDeny([
			"cd /repo",
			"cat ~/.assist/restricted/notes.md",
		]);

		expect(decision?.permissionDecision).toBe("deny");
	});

	it("does not deny reads of other assist directories", () => {
		expect(
			findRestrictedPathDeny(["cat ~/.assist/daemon/daemon.log"]),
		).toBeUndefined();
	});

	it("denies a path that merely starts with the restricted directory name", () => {
		expect(
			findRestrictedPathDeny(["ls ~/.assist/restrictedish"]),
		).toBeDefined();
	});

	it("does not deny an unrelated command", () => {
		expect(findRestrictedPathDeny(["ls -la src"])).toBeUndefined();
	});
});

describe("findRestrictedPathDenyRaw", () => {
	it("denies a command that does not split into parts", () => {
		const decision = findRestrictedPathDenyRaw(
			'for f in ~/.assist/restricted/*; do cat "$f"; done',
		);

		expect(decision?.permissionDecision).toBe("deny");
	});

	it("does not deny an unrelated unsplittable command", () => {
		expect(
			findRestrictedPathDenyRaw('for f in src/*; do cat "$f"; done'),
		).toBeUndefined();
	});
});
