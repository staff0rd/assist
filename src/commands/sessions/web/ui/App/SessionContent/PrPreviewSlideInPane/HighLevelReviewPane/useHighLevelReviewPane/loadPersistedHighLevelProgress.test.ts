// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { highLevelProgressHead } from "./highLevelProgressHead";
import {
	clearPersistedHighLevelProgress,
	type HighLevelPaneProgress,
	loadPersistedHighLevelProgress,
	savePersistedHighLevelProgress,
} from "./loadPersistedHighLevelProgress";

const head = highLevelProgressHead({
	repo: "acme/app",
	prNumber: 7,
	headSha: "abc123",
});

const progress: HighLevelPaneProgress = {
	items: [{ id: "scope", ticked: true, comment: "tight" }],
	reviewComments: [
		{
			path: "src/a.ts",
			startLine: 3,
			endLine: 3,
			quote: "const a = 1;",
			note: "rename this",
		},
	],
};

describe("loadPersistedHighLevelProgress", () => {
	beforeEach(() => localStorage.clear());

	it("restores progress when the same request reopens", () => {
		savePersistedHighLevelProgress("req-1", head, progress);
		expect(loadPersistedHighLevelProgress("req-1", undefined, head)).toEqual(
			progress,
		);
	});

	it("restores progress for a fresh requestId on the same PR head after a daemon restart", () => {
		savePersistedHighLevelProgress("req-1", head, progress);
		expect(loadPersistedHighLevelProgress("req-2", undefined, head)).toEqual(
			progress,
		);
	});

	it("does not restore progress for a different PR head", () => {
		savePersistedHighLevelProgress("req-1", head, progress);
		const other = highLevelProgressHead({
			repo: "acme/app",
			prNumber: 7,
			headSha: "def456",
		});
		expect(
			loadPersistedHighLevelProgress("req-2", undefined, other),
		).toBeUndefined();
	});

	it("carries progress from a superseded request", () => {
		savePersistedHighLevelProgress("req-1", undefined, progress);
		expect(loadPersistedHighLevelProgress("req-2", "req-1", head)).toEqual(
			progress,
		);
	});

	it("drops head progress once the review is decided", () => {
		savePersistedHighLevelProgress("req-1", head, progress);
		clearPersistedHighLevelProgress("req-1", head);
		expect(
			loadPersistedHighLevelProgress("req-2", undefined, head),
		).toBeUndefined();
	});
});
