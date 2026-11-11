import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createSyncFiles } from "./createSyncFiles";
import { pruneCommands } from "./pruneCommands";

function seedTarget(...entries: string[]): string {
	const targetDir = mkdtempSync(join(tmpdir(), "prune-commands-"));
	for (const entry of entries) {
		if (entry.endsWith("/")) {
			mkdirSync(join(targetDir, entry), { recursive: true });
		} else {
			writeFileSync(join(targetDir, entry), "content");
		}
	}
	return targetDir;
}

const ownsAll = { owns: () => true, forget: () => {} };

describe("pruneCommands", () => {
	it("reports nothing when every command file matches a source name", () => {
		const targetDir = seedTarget("commit.md", "verify.md");

		const result = pruneCommands(targetDir, ["commit", "verify"], {
			force: false,
			owner: ownsAll,
		});

		expect(result).toEqual({
			orphans: [],
			removed: [],
			skipped: [],
			unmanaged: [],
		});
	});

	it("lists orphans without removing them when not forced", () => {
		const targetDir = seedTarget("commit.md", "review-comments.md");

		const result = pruneCommands(targetDir, ["commit"], {
			force: false,
			owner: ownsAll,
		});

		expect(result.orphans).toEqual(["review-comments.md"]);
		expect(result.removed).toEqual([]);
		expect(existsSync(join(targetDir, "review-comments.md"))).toBe(true);
		expect(existsSync(join(targetDir, "commit.md"))).toBe(true);
	});

	it("removes orphans when forced", () => {
		const targetDir = seedTarget(
			"commit.md",
			"associate-jira.md",
			"next-backlog-item.md",
		);

		const result = pruneCommands(targetDir, ["commit"], {
			force: true,
			owner: ownsAll,
		});

		expect(result.orphans).toEqual([
			"associate-jira.md",
			"next-backlog-item.md",
		]);
		expect(result.removed).toEqual([
			"associate-jira.md",
			"next-backlog-item.md",
		]);
		expect(existsSync(join(targetDir, "associate-jira.md"))).toBe(false);
		expect(existsSync(join(targetDir, "next-backlog-item.md"))).toBe(false);
		expect(existsSync(join(targetDir, "commit.md"))).toBe(true);
	});

	it("never removes subdirectories or non-md files", () => {
		const targetDir = seedTarget("commit.md", "notes.txt", "archive/");

		const result = pruneCommands(targetDir, ["commit"], {
			force: true,
			owner: ownsAll,
		});

		expect(result.unmanaged.sort()).toEqual(["archive", "notes.txt"]);
		expect(result.orphans).toEqual([]);
		expect(result.removed).toEqual([]);
		expect(existsSync(join(targetDir, "notes.txt"))).toBe(true);
		expect(existsSync(join(targetDir, "archive"))).toBe(true);
	});

	it("returns an empty result when the target dir does not exist", () => {
		const result = pruneCommands(join(tmpdir(), "prune-commands-missing"), [], {
			force: true,
			owner: ownsAll,
		});

		expect(result).toEqual({
			orphans: [],
			removed: [],
			skipped: [],
			unmanaged: [],
		});
	});

	it("never removes a command file sync did not write", () => {
		const targetDir = seedTarget("notes.md", "retired.md");
		const owner = createSyncFiles([join(targetDir, "retired.md")]);

		const result = pruneCommands(targetDir, [], { force: true, owner });

		expect(result.unmanaged).toEqual(["notes.md"]);
		expect(result.removed).toEqual(["retired.md"]);
		expect(existsSync(join(targetDir, "notes.md"))).toBe(true);
	});
});
