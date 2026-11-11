import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { createSyncFiles } from "./createSyncFiles";
import { pruneSkills } from "./pruneSkills";

function seedTarget(...entries: string[]): string {
	const targetDir = mkdtempSync(join(tmpdir(), "prune-skills-"));
	for (const entry of entries) {
		const full = join(targetDir, entry);
		if (entry.endsWith("/")) {
			mkdirSync(full, { recursive: true });
		} else {
			mkdirSync(dirname(full), { recursive: true });
			writeFileSync(full, "content");
		}
	}
	return targetDir;
}

const ownsAll = { owns: () => true, forget: () => {} };

describe("pruneSkills", () => {
	it("reports nothing when every skill dir matches a source name", () => {
		const targetDir = seedTarget("commit/SKILL.md", "verify/SKILL.md");

		const result = pruneSkills(targetDir, ["commit", "verify"], {
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

	it("lists orphan skill dirs without removing them when not forced", () => {
		const targetDir = seedTarget("commit/SKILL.md", "review-comments/SKILL.md");

		const result = pruneSkills(targetDir, ["commit"], {
			force: false,
			owner: ownsAll,
		});

		expect(result.orphans).toEqual(["review-comments"]);
		expect(result.removed).toEqual([]);
		expect(existsSync(join(targetDir, "review-comments"))).toBe(true);
	});

	it("removes an orphan skill dir whose sole content is SKILL.md", () => {
		const targetDir = seedTarget("commit/SKILL.md", "associate-jira/SKILL.md");

		const result = pruneSkills(targetDir, ["commit"], {
			force: true,
			owner: ownsAll,
		});

		expect(result.orphans).toEqual(["associate-jira"]);
		expect(result.removed).toEqual(["associate-jira"]);
		expect(result.skipped).toEqual([]);
		expect(existsSync(join(targetDir, "associate-jira"))).toBe(false);
		expect(existsSync(join(targetDir, "commit", "SKILL.md"))).toBe(true);
	});

	it("skips an orphan skill dir holding anything besides SKILL.md", () => {
		const targetDir = seedTarget(
			"custom/SKILL.md",
			"custom/notes.md",
			"custom/scripts/run.sh",
		);

		const result = pruneSkills(targetDir, [], { force: true, owner: ownsAll });

		expect(result.orphans).toEqual(["custom"]);
		expect(result.removed).toEqual([]);
		expect(result.skipped).toEqual([
			{ name: "custom", reason: "contains notes.md, scripts" },
		]);
		expect(existsSync(join(targetDir, "custom", "SKILL.md"))).toBe(true);
	});

	it("skips an orphan skill dir with no SKILL.md", () => {
		const targetDir = seedTarget("empty/");

		const result = pruneSkills(targetDir, [], { force: true, owner: ownsAll });

		expect(result.skipped).toEqual([{ name: "empty", reason: "no SKILL.md" }]);
		expect(existsSync(join(targetDir, "empty"))).toBe(true);
	});

	it("never removes files sitting alongside the skill dirs", () => {
		const targetDir = seedTarget("commit/SKILL.md", "notes.txt");

		const result = pruneSkills(targetDir, ["commit"], {
			force: true,
			owner: ownsAll,
		});

		expect(result.unmanaged).toEqual(["notes.txt"]);
		expect(result.orphans).toEqual([]);
		expect(existsSync(join(targetDir, "notes.txt"))).toBe(true);
	});

	it("returns an empty result when the target dir does not exist", () => {
		const result = pruneSkills(join(tmpdir(), "prune-skills-missing"), [], {
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

	it("never removes a skill dir sync did not write", () => {
		const targetDir = seedTarget("mine/SKILL.md", "retired/SKILL.md");
		const owner = createSyncFiles([join(targetDir, "retired", "SKILL.md")]);

		const result = pruneSkills(targetDir, [], { force: true, owner });

		expect(result.unmanaged).toEqual(["mine"]);
		expect(result.removed).toEqual(["retired"]);
		expect(existsSync(join(targetDir, "mine", "SKILL.md"))).toBe(true);
		expect(owner.owns(join(targetDir, "retired", "SKILL.md"))).toBe(false);
	});
});
