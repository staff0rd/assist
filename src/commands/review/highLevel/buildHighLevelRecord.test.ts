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
	tests: [
		{
			path: "src/a.test.ts",
			status: "added" as const,
			additions: 3,
			deletions: 0,
			diffUrl: "https://github.com/org/repo/pull/42/files#diff-a",
			tests: [
				{
					kind: "describe" as const,
					name: "a",
					line: 1,
					children: [
						{
							kind: "it" as const,
							id: "src/a.test.ts:2",
							name: "adds",
							line: 2,
						},
					],
				},
			],
		},
	],
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

	it("carries a comment on an individual test with its title path", () => {
		const record = buildHighLevelRecord(
			subject,
			decision({
				checklist: [
					{
						id: "structure-sensible",
						ticked: true,
						notes: [
							{ id: "src/a.test.ts:2", comment: " tautological " },
							{ id: "src/a.test.ts:99", comment: "gone" },
						],
					},
				],
			}),
		);

		expect(record.items[1]?.testComments).toEqual([
			{
				id: "src/a.test.ts:2",
				path: "src/a.test.ts",
				line: 2,
				title: ["a", "adds"],
				comment: "tautological",
			},
		]);
	});

	it("falls back to the evaluated status when the overlay sent no state", () => {
		const record = buildHighLevelRecord(subject, decision());

		expect(record.items.map((item) => item.ticked)).toEqual([false, false]);
	});
});
