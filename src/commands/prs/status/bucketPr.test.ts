import { describe, expect, it } from "vitest";
import { bucketPr } from "./bucketPr";
import type { PrStatusFacts } from "./types";

const clean: PrStatusFacts = {
	number: 1,
	title: "Add a thing",
	url: "https://github.com/org/repo/pull/1",
	author: "alice",
	isBot: false,
	isDraft: false,
	isDoNotMerge: false,
	createdAt: "2026-09-10T09:00:00Z",
	updatedAt: "2026-09-16T12:00:00Z",
	age: "2d",
	ageHours: 48,
	reviewDecision: "REVIEW_REQUIRED",
	reviews: [],
	checks: { failing: [], pending: [] },
	mergeable: "MERGEABLE",
	unresolvedThreads: 0,
};

describe("bucketPr", () => {
	it("excludes drafts and do-not-merge titles", () => {
		expect(bucketPr({ ...clean, isDraft: true })).toBe("excluded");
		expect(bucketPr({ ...clean, isDoNotMerge: true })).toBe("excluded");
	});

	it("puts a clean pull request awaiting review in pending review", () => {
		expect(bucketPr(clean)).toBe("pendingReview");
		expect(bucketPr({ ...clean, reviewDecision: null })).toBe("pendingReview");
	});

	it("puts requested changes or unresolved threads in changes requested", () => {
		expect(bucketPr({ ...clean, reviewDecision: "CHANGES_REQUESTED" })).toBe(
			"changesRequested",
		);
		expect(bucketPr({ ...clean, unresolvedThreads: 2 })).toBe(
			"changesRequested",
		);
	});

	it("prefers changes requested over failing checks", () => {
		expect(
			bucketPr({
				...clean,
				unresolvedThreads: 1,
				checks: { failing: ["lint"], pending: [] },
			}),
		).toBe("changesRequested");
	});

	it("puts failing checks or conflicts in failing checks", () => {
		expect(
			bucketPr({ ...clean, checks: { failing: ["lint"], pending: [] } }),
		).toBe("failingChecks");
		expect(bucketPr({ ...clean, mergeable: "CONFLICTING" })).toBe(
			"failingChecks",
		);
	});

	it("puts an approved clean pull request in ready to merge", () => {
		expect(bucketPr({ ...clean, reviewDecision: "APPROVED" })).toBe(
			"readyToMerge",
		);
	});

	it("treats an approval without a review decision as ready to merge", () => {
		expect(
			bucketPr({
				...clean,
				reviewDecision: null,
				reviews: [{ reviewer: "bob", state: "APPROVED" }],
			}),
		).toBe("readyToMerge");
	});
});
