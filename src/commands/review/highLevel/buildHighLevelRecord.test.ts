import { describe, expect, it } from "vitest";
import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import { buildHighLevelRecord } from "./buildHighLevelRecord";
import type { HighLevelCheckResult } from "./types";

const checks: HighLevelCheckResult[] = [
	{
		id: "description-what-why",
		kind: "deterministic",
		title: "Description has a What and a Why",
		backing: "The PR body",
		status: "fail",
		reason: "no `## Why` section",
	},
	{
		id: "structure-sensible",
		kind: "manual",
		title: "The structure of the change is sensible",
		short: "Structure",
		backing: "The changed-file tree",
		status: "manual",
		reason: "The changed-file tree",
	},
];

const subject = {
	repo: "org/repo",
	prNumber: 42,
	headRef: "feat/thing",
	headSha: "abc123",
	checks,
};

function decision(overrides: Partial<PreviewDecision> = {}): PreviewDecision {
	return { decision: "approve", ...overrides };
}

describe("buildHighLevelRecord", () => {
	it("records an approve verdict against the reviewed head", () => {
		const record = buildHighLevelRecord(subject, decision());

		expect(record).toMatchObject({
			repo: "org/repo",
			prNumber: 42,
			headRef: "feat/thing",
			headSha: "abc123",
			verdict: "approve",
		});
	});

	it("records a reject as request-changes", () => {
		expect(
			buildHighLevelRecord(subject, decision({ decision: "reject" })).verdict,
		).toBe("request-changes");
	});

	it("carries each item's ticked state and comment", () => {
		const record = buildHighLevelRecord(
			subject,
			decision({
				checklist: [
					{ id: "description-what-why", ticked: false, comment: "  fix it  " },
					{ id: "structure-sensible", ticked: true },
				],
			}),
		);

		expect(record.items).toEqual([
			{
				id: "description-what-why",
				kind: "deterministic",
				title: "Description has a What and a Why",
				status: "fail",
				reason: "no `## Why` section",
				ticked: false,
				comment: "fix it",
			},
			{
				id: "structure-sensible",
				kind: "manual",
				title: "The structure of the change is sensible",
				status: "manual",
				reason: "The changed-file tree",
				ticked: true,
			},
		]);
	});

	it.each([
		["APPROVE", "approve"],
		["COMMENT", "comment"],
		["REQUEST_CHANGES", "request-changes"],
	] as const)("records a %s review event as %s", (reviewEvent, verdict) => {
		expect(
			buildHighLevelRecord(subject, decision({ reviewEvent })).verdict,
		).toBe(verdict);
	});

	it("saves the queued review comments", () => {
		const reviewComments = [
			{
				path: "src/a.test.ts",
				startLine: 2,
				endLine: 2,
				quote: "adds",
				note: "tautological",
			},
			{
				path: "src/a.ts",
				startLine: 5,
				endLine: 7,
				quote: "removed",
				note: "why drop this?",
				startSide: "LEFT" as const,
				side: "LEFT" as const,
			},
		];

		const record = buildHighLevelRecord(subject, decision({ reviewComments }));

		expect(record.reviewComments).toEqual(reviewComments);
		expect(buildHighLevelRecord(subject, decision())).not.toHaveProperty(
			"reviewComments",
		);
	});

	it("keys the per-slice checks by slice when the review is sliced", () => {
		const slice = (title: string) => ({
			title,
			summary: "",
			hunks: [],
			additions: 0,
			deletions: 0,
		});
		const record = buildHighLevelRecord(
			{ ...subject, slices: [slice("Add gate"), slice("Move helpers")] },
			decision({
				checklist: [
					{ id: "description-what-why", ticked: true },
					{ id: "structure-sensible", ticked: true, slice: 2, comment: "ok" },
				],
			}),
		);

		expect(
			record.items.map(({ id, ticked, comment, slice, sliceTitle }) => ({
				id,
				ticked,
				comment,
				slice,
				sliceTitle,
			})),
		).toEqual([
			{ id: "description-what-why", ticked: true },
			{
				id: "structure-sensible",
				ticked: false,
				slice: 1,
				sliceTitle: "Add gate",
			},
			{
				id: "structure-sensible",
				ticked: true,
				comment: "ok",
				slice: 2,
				sliceTitle: "Move helpers",
			},
		]);
	});

	it("falls back to the evaluated status when the overlay sent no state", () => {
		const record = buildHighLevelRecord(subject, decision());

		expect(record.items.map((item) => item.ticked)).toEqual([false, false]);
	});
});
