import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { saveHighLevelReview } from "./saveHighLevelReview";
import type { HighLevelReviewRecord } from "./types";

const record: HighLevelReviewRecord = {
	repo: "org/repo",
	prNumber: 42,
	headRef: "feat/thing",
	headSha: "abc123",
	verdict: "approve",
	reviewedAt: "2026-01-01T00:00:00.000Z",
	items: [],
};

let store: string;
const original = process.env.ASSIST_STORE_DIR;

beforeEach(() => {
	store = mkdtempSync(join(tmpdir(), "assist-high-level-"));
	process.env.ASSIST_STORE_DIR = store;
});

afterEach(() => {
	if (original === undefined) delete process.env.ASSIST_STORE_DIR;
	else process.env.ASSIST_STORE_DIR = original;
});

describe("saveHighLevelReview", () => {
	it("writes the review under the repo, keyed by branch and head sha", () => {
		const path = saveHighLevelReview(record);

		expect(path).toBe(
			join(store, "high-level-reviews", "org-repo", "feat-thing-abc123.json"),
		);
		expect(JSON.parse(readFileSync(path, "utf8"))).toEqual(record);
	});

	it("rewrites the same path for a second review of the same head", () => {
		saveHighLevelReview(record);
		const path = saveHighLevelReview({ ...record, verdict: "request-changes" });

		expect(
			(JSON.parse(readFileSync(path, "utf8")) as HighLevelReviewRecord).verdict,
		).toBe("request-changes");
	});
});
