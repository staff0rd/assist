import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gatherHighLevelSlices } from "./gatherHighLevelSlices";
import { highLevelSlicesPath } from "./highLevelSlicesPath";
import type { HighLevelFile } from "./types";

const head = { repo: "org/repo", headRef: "feat/x", headSha: "abc123" };
const files: HighLevelFile[] = [
	{
		path: "src/a.ts",
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: "https://example.test/a",
		patch: "@@ -1 +1 @@\n-old\n+new",
	},
];

let store: string;
const original = process.env.ASSIST_STORE_DIR;

beforeEach(() => {
	store = mkdtempSync(join(tmpdir(), "assist-high-level-slices-"));
	process.env.ASSIST_STORE_DIR = store;
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((code) => {
		throw new Error(`exit ${code}`);
	});
});

afterEach(() => {
	vi.restoreAllMocks();
	if (original === undefined) delete process.env.ASSIST_STORE_DIR;
	else process.env.ASSIST_STORE_DIR = original;
});

function slicesFile(content: unknown): string {
	const path = join(store, "slices.json");
	writeFileSync(path, JSON.stringify(content));
	return path;
}

describe("gatherHighLevelSlices", () => {
	it("refuses with exit 2, printing labelled hunks and the rules, when nothing is saved", () => {
		expect(() => gatherHighLevelSlices(head, files, { force: false })).toThrow(
			"exit 2",
		);
		const printed = vi.mocked(console.log).mock.calls[0]?.[0] as string;
		expect(printed).toMatch(/^Slicing required:/);
		expect(printed).toContain("### src/a.ts#0\n@@ -1 +1 @@\n-old\n+new");
		expect(printed).toContain(
			"Tests go in the same slice as the code they test",
		);
	});

	it("saves slices from --slices per head SHA and reuses them on reopen", () => {
		const fromFile = gatherHighLevelSlices(head, files, {
			force: false,
			slicesFile: slicesFile([
				{ title: "Swap", summary: "s", hunks: ["src/a.ts#0", "x#1"] },
			]),
		});

		expect(console.warn).toHaveBeenCalledWith(
			'Warning: Dropped unknown hunk x#1 from "Swap".',
		);
		expect(
			existsSync(highLevelSlicesPath(head.repo, head.headRef, head.headSha)),
		).toBe(true);
		expect(gatherHighLevelSlices(head, files, { force: false })).toEqual(
			fromFile,
		);
	});

	it("asks to re-slice with --force even when slices are saved", () => {
		gatherHighLevelSlices(head, files, {
			force: false,
			slicesFile: slicesFile([{ title: "Swap", summary: "", hunks: [] }]),
		});

		expect(() => gatherHighLevelSlices(head, files, { force: true })).toThrow(
			"exit 2",
		);
	});
});
