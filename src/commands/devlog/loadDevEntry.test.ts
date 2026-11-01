import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadAllDevLatestWeeks } from "./loadAllDevLatestWeeks";
import { loadDevEntry } from "./loadDevEntry";

let devDir: string;

beforeEach(() => {
	devDir = mkdtempSync(join(tmpdir(), "dev-entry-"));
});

afterEach(() => {
	rmSync(devDir, { recursive: true, force: true });
});

function writeEntry(repo: string, file: string, content: string): void {
	mkdirSync(join(devDir, repo), { recursive: true });
	writeFileSync(join(devDir, repo, file), content);
}

describe("loadDevEntry", () => {
	it("reads the title and version range from the week's frontmatter", () => {
		writeEntry(
			"assist",
			"2026-w33.md",
			"---\nproject: assist\nweek: 2026-W33\ntitle: Comment previews\nversions:\n  first: v0.568\n  last: v0.570\n---\n\nLede.\n",
		);
		expect(loadDevEntry("assist", "2026-W33", devDir)).toEqual({
			title: "Comment previews",
			firstVersion: "v0.568",
			lastVersion: "v0.570",
		});
	});

	it("leaves versions empty when the entry has none", () => {
		writeEntry("blog", "2026-w33.md", "---\ntitle: Hero band\n---\n");
		expect(loadDevEntry("blog", "2026-W33", devDir)).toEqual({
			title: "Hero band",
			firstVersion: null,
			lastVersion: null,
		});
	});

	it("returns null when the week has no entry", () => {
		expect(loadDevEntry("assist", "2026-W34", devDir)).toBeNull();
	});
});

describe("loadAllDevLatestWeeks", () => {
	it("maps each project directory to its latest week", () => {
		writeEntry("assist", "2026-w33.md", "");
		writeEntry("assist", "2026-w40.md", "");
		writeEntry("blog", "2026-w01.md", "");
		mkdirSync(join(devDir, "empty"));
		writeFileSync(join(devDir, "stray.md"), "");

		expect(loadAllDevLatestWeeks(devDir)).toEqual(
			new Map([
				["assist", "2026-W40"],
				["blog", "2026-W01"],
			]),
		);
	});
});
