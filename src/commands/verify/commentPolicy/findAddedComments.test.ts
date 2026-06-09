import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { findAddedComments } from "./findAddedComments";

const SOURCE = [
	"const a = 1;",
	"// added comment here",
	"const b = 2;",
	"// HACK: justified reason",
	"const c = 3;",
	"// pre-existing untouched comment",
	"const d = 4;",
	"",
].join("\n");

let tmpDir: string;
let filePath: string;

function diffAddingLine(startLine: number): string {
	return [
		`+++ b/${filePath}`,
		`@@ -1,0 +${startLine},1 @@`,
		"+placeholder",
	].join("\n");
}

beforeEach(() => {
	vi.clearAllMocks();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "comment-policy-"));
	filePath = path.join(tmpDir, "sample.ts");
	fs.writeFileSync(filePath, SOURCE);
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("findAddedComments", () => {
	it("flags an unjustified comment added on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingLine(2));

		const findings = findAddedComments({ markers: ["HACK:"], ignoreGlobs: [] });

		expect(findings).toEqual([
			{ file: filePath, line: 2, text: "// added comment here" },
		]);
	});

	it("does not flag a comment carrying a justification marker", () => {
		mockExecSync.mockReturnValue(diffAddingLine(4));

		const findings = findAddedComments({ markers: ["HACK:"], ignoreGlobs: [] });

		expect(findings).toEqual([]);
	});

	it("does not flag comments on lines that were not changed", () => {
		mockExecSync.mockReturnValue(diffAddingLine(1));

		const findings = findAddedComments({ markers: ["HACK:"], ignoreGlobs: [] });

		expect(findings).toEqual([]);
	});

	it("skips files matching an ignore glob", () => {
		mockExecSync.mockReturnValue(diffAddingLine(2));

		const findings = findAddedComments({
			markers: ["HACK:"],
			ignoreGlobs: ["**/sample.ts"],
		});

		expect(findings).toEqual([]);
	});
});
