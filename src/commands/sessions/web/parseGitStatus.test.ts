import { describe, expect, it } from "vitest";
import { parseGitStatus } from "./parseGitStatus";

describe("parseGitStatus", () => {
	it("groups untracked files as new", () => {
		expect(parseGitStatus("?? added.ts")).toEqual({
			new: ["added.ts"],
			modified: [],
			deleted: [],
		});
	});

	it("groups staged-added files as new", () => {
		expect(parseGitStatus("A  staged.ts")).toEqual({
			new: ["staged.ts"],
			modified: [],
			deleted: [],
		});
	});

	it("groups modified files as modified", () => {
		expect(parseGitStatus(" M worktree.ts")).toEqual({
			new: [],
			modified: ["worktree.ts"],
			deleted: [],
		});
	});

	it("groups renamed files as modified, using the new path", () => {
		expect(parseGitStatus("R  old.ts -> new.ts")).toEqual({
			new: [],
			modified: ["new.ts"],
			deleted: [],
		});
	});

	it("groups deleted files as deleted", () => {
		expect(parseGitStatus(" D gone.ts")).toEqual({
			new: [],
			modified: [],
			deleted: ["gone.ts"],
		});
	});

	it("groups an unmerged (UU) conflict file as modified", () => {
		expect(parseGitStatus("UU conflicted.ts")).toEqual({
			new: [],
			modified: ["conflicted.ts"],
			deleted: [],
		});
	});

	it("groups all unmerged conflict states as modified", () => {
		const output = [
			"DD both-deleted.ts",
			"AU added-by-us.ts",
			"UD deleted-by-them.ts",
			"UA added-by-them.ts",
			"DU deleted-by-us.ts",
			"AA both-added.ts",
			"UU both-modified.ts",
		].join("\n");
		expect(parseGitStatus(output)).toEqual({
			new: [],
			modified: [
				"both-deleted.ts",
				"added-by-us.ts",
				"deleted-by-them.ts",
				"added-by-them.ts",
				"deleted-by-us.ts",
				"both-added.ts",
				"both-modified.ts",
			],
			deleted: [],
		});
	});

	it("ignores blank lines and parses multiple entries", () => {
		const output = ["?? a.ts", " M b.ts", " D c.ts", ""].join("\n");
		expect(parseGitStatus(output)).toEqual({
			new: ["a.ts"],
			modified: ["b.ts"],
			deleted: ["c.ts"],
		});
	});

	it("returns empty groups for empty output", () => {
		expect(parseGitStatus("")).toEqual({
			new: [],
			modified: [],
			deleted: [],
		});
	});
});
