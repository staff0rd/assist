import { describe, expect, it } from "vitest";
import { toPrStatus } from "./toPrStatus";
import type { GhStatusPullRequest } from "./types";

const NOW = new Date("2026-09-18T12:00:00Z").getTime();

const basePr: GhStatusPullRequest = {
	number: 12,
	title: "Add a thing",
	url: "https://github.com/org/repo/pull/12",
	author: { login: "alice" },
	isDraft: false,
	createdAt: "2026-09-10T09:00:00Z",
	updatedAt: "2026-09-16T12:00:00Z",
	reviewDecision: "REVIEW_REQUIRED",
	latestReviews: [{ author: { login: "bob" }, state: "COMMENTED" }],
	statusCheckRollup: [
		{ name: "lint", status: "COMPLETED", conclusion: "FAILURE" },
	],
	mergeable: "CONFLICTING",
};

describe("toPrStatus", () => {
	it("maps a pull request onto the reported facts", () => {
		expect(toPrStatus(basePr, 2, NOW)).toEqual({
			number: 12,
			title: "Add a thing",
			url: "https://github.com/org/repo/pull/12",
			author: "alice",
			isBot: false,
			isDraft: false,
			createdAt: "2026-09-10T09:00:00Z",
			updatedAt: "2026-09-16T12:00:00Z",
			age: "2d",
			ageHours: 48,
			reviewDecision: "REVIEW_REQUIRED",
			reviews: [{ reviewer: "bob", state: "COMMENTED" }],
			checks: { failing: ["lint"], pending: [] },
			mergeable: "CONFLICTING",
			unresolvedThreads: 2,
		});
	});

	it("derives the age from updatedAt", () => {
		const pr = { ...basePr, updatedAt: "2026-09-18T09:00:00Z" };

		expect(toPrStatus(pr, 0, NOW)).toMatchObject({ age: "3h", ageHours: 3 });
	});

	it("carries an unknown unresolved thread count through", () => {
		expect(toPrStatus(basePr, null, NOW)).toMatchObject({
			unresolvedThreads: null,
		});
	});

	it("flags drafts and bot authors", () => {
		const pr = {
			...basePr,
			isDraft: true,
			author: { login: "dependabot", is_bot: true },
		};

		expect(toPrStatus(pr, 0, NOW)).toMatchObject({
			isDraft: true,
			isBot: true,
			author: "dependabot",
		});
	});

	describe("when fields are absent", () => {
		it("falls back to unknown values", () => {
			const pr: GhStatusPullRequest = {
				number: 3,
				title: "Bare",
				url: "https://github.com/org/repo/pull/3",
				createdAt: "2026-09-18T11:00:00Z",
				updatedAt: "2026-09-18T11:00:00Z",
			};

			expect(toPrStatus(pr, 0, NOW)).toMatchObject({
				author: "unknown",
				isBot: false,
				isDraft: false,
				reviewDecision: null,
				reviews: [],
				checks: { failing: [], pending: [] },
				mergeable: "UNKNOWN",
			});
		});

		it("names a reviewer whose author is missing", () => {
			const pr = { ...basePr, latestReviews: [{ state: "APPROVED" }] };

			expect(toPrStatus(pr, 0, NOW).reviews).toEqual([
				{ reviewer: "unknown", state: "APPROVED" },
			]);
		});
	});
});
