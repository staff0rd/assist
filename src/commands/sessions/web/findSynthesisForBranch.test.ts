import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findSynthesisForBranch } from "./findSynthesisForBranch";

let repoReviewsDir: string;

function writeSynthesis(
	key: string,
	body: string,
	mtimeSeconds?: number,
): string {
	const dir = join(repoReviewsDir, key);
	mkdirSync(dir, { recursive: true });
	const path = join(dir, "synthesis.md");
	writeFileSync(path, body);
	if (mtimeSeconds !== undefined) utimesSync(path, mtimeSeconds, mtimeSeconds);
	return path;
}

beforeEach(() => {
	repoReviewsDir = mkdtempSync(join(tmpdir(), "assist-reviews-"));
});

afterEach(() => {
	rmSync(repoReviewsDir, { recursive: true, force: true });
});

describe("findSynthesisForBranch", () => {
	it("returns null when no review dir exists for the branch", () => {
		expect(findSynthesisForBranch(repoReviewsDir, "main")).toBeNull();
	});

	it("returns the synthesis path for the branch", () => {
		const path = writeSynthesis("main-abc1234", "# review");
		expect(findSynthesisForBranch(repoReviewsDir, "main")).toBe(path);
	});

	it("returns null when the review dir has no synthesis", () => {
		mkdirSync(join(repoReviewsDir, "main-abc1234"), { recursive: true });
		writeFileSync(join(repoReviewsDir, "main-abc1234", "request.md"), "req");
		expect(findSynthesisForBranch(repoReviewsDir, "main")).toBeNull();
	});

	it("picks the most recently written synthesis when the branch has several shas", () => {
		writeSynthesis("main-aaaaaaa", "old", 1000);
		const newer = writeSynthesis("main-bbbbbbb", "new", 2000);
		expect(findSynthesisForBranch(repoReviewsDir, "main")).toBe(newer);
	});

	it("resolves branches containing slashes", () => {
		const path = writeSynthesis(join("feat", "thing-abc1234"), "# review");
		expect(findSynthesisForBranch(repoReviewsDir, "feat/thing")).toBe(path);
	});

	it("does not match a different branch that shares a prefix", () => {
		writeSynthesis("main-abc1234", "review");
		expect(findSynthesisForBranch(repoReviewsDir, "mai")).toBeNull();
	});
});
