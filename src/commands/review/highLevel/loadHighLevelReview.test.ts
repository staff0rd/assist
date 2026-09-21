import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadHighLevelReview } from "./loadHighLevelReview";
import { saveHighLevelReview } from "./saveHighLevelReview";
import type { HighLevelReviewRecord } from "./types";

const record: HighLevelReviewRecord = {
	repo: "org/repo",
	prNumber: 42,
	headRef: "feat/thing",
	headSha: "abc123",
	verdict: "request-changes",
	reviewedAt: "2026-01-01T00:00:00.000Z",
	items: [
		{
			id: "structure-sensible",
			kind: "manual",
			title: "The structure of the change is sensible",
			status: "manual",
			reason: "the tree",
			ticked: true,
			comment: "looked fine",
		},
	],
};

let store: string;
const original = process.env.ASSIST_STORE_DIR;

beforeEach(() => {
	store = mkdtempSync(join(tmpdir(), "assist-high-level-load-"));
	process.env.ASSIST_STORE_DIR = store;
});

afterEach(() => {
	if (original === undefined) delete process.env.ASSIST_STORE_DIR;
	else process.env.ASSIST_STORE_DIR = original;
});

describe("loadHighLevelReview", () => {
	it("reads back the review saved for the same head sha", () => {
		saveHighLevelReview(record);

		expect(loadHighLevelReview("org/repo", "feat/thing", "abc123")).toEqual(
			record,
		);
	});

	it("finds nothing for a different head sha", () => {
		saveHighLevelReview(record);

		expect(
			loadHighLevelReview("org/repo", "feat/thing", "def456"),
		).toBeUndefined();
	});

	it("finds nothing when the saved file is unreadable", () => {
		const path = join(
			store,
			"high-level-reviews",
			"org-repo",
			"feat-thing-abc123.json",
		);
		saveHighLevelReview(record);
		writeFileSync(path, "{ not json");

		expect(
			loadHighLevelReview("org/repo", "feat/thing", "abc123"),
		).toBeUndefined();
	});
});
