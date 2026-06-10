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
