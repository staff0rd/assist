import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { findComments } from "./findComments";

const SOURCE = [
	"const a = 1;",
	"// a narration comment",
	"const b = 2;",
	"// HACK: formerly justified, now still blocked",
	"const c = 3;",
	"// oxlint-disable-next-line no-explicit-any",
	"const d = 4;",
	"// pre-existing untouched comment",
	"const e = 5;",
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
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "block-comments-"));
	filePath = path.join(tmpDir, "sample.ts");
	fs.writeFileSync(filePath, SOURCE);
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("findComments", () => {
	it("flags a comment added on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingLine(2));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([
			{ file: filePath, line: 2, text: "// a narration comment" },
		]);
	});

	it("flags a comment even when it carries a former justification marker", () => {
		mockExecSync.mockReturnValue(diffAddingLine(4));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([
			{
				file: filePath,
				line: 4,
				text: "// HACK: formerly justified, now still blocked",
			},
		]);
	});

	it("exempts functional machine directives on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingLine(6));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([]);
	});

	it("does not flag comments on lines that were not changed", () => {
		mockExecSync.mockReturnValue(diffAddingLine(9));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([]);
	});

	it("skips files matching an ignore glob", () => {
		mockExecSync.mockReturnValue(diffAddingLine(2));

		const findings = findComments({ ignoreGlobs: ["**/sample.ts"] });

		expect(findings).toEqual([]);
	});
});
