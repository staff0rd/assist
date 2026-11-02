import { describe, expect, it } from "vitest";
import { formatHighLevelReviewBody } from "./formatHighLevelReviewBody";
import type { HighLevelReviewItem } from "./types";

function item(overrides: Partial<HighLevelReviewItem>): HighLevelReviewItem {
	return {
		id: "structure-sensible",
		kind: "manual",
		title: "The structure of the change is sensible",
		status: "manual",
		reason: "The changed-file tree",
		ticked: true,
		...overrides,
	};
}

describe("formatHighLevelReviewBody", () => {
	it("is empty when no comments were left", () => {
		expect(formatHighLevelReviewBody([item({}), item({})])).toBe("");
	});

	it("lists each commented failed check as a ❌ finding", () => {
		const body = formatHighLevelReviewBody([
			item({
				kind: "deterministic",
				status: "fail",
				title: "PR links the GitHub issue it resolves",
				comment: "no github issue linked",
			}),
			item({
				kind: "deterministic",
				status: "fail",
				title: "PR has a description",
			}),
			item({
				kind: "deterministic",
				status: "fail",
				title: "No merge conflicts",
				comment: "has merge conflicts",
			}),
		]);

		expect(body).toBe(
			[
				"- ❌ **PR links the GitHub issue it resolves** — no github issue linked",
				"- ❌ **No merge conflicts** — has merge conflicts",
			].join("\n"),
		);
	});

	it("marks commented manual checks 💬 and passing checks ✅", () => {
		const body = formatHighLevelReviewBody([
			item({ status: "manual", title: "Structure", comment: "Nice split" }),
			item({ status: "manual", title: "Description" }),
			item({
				kind: "deterministic",
				status: "pass",
				title: "CI passes",
				comment: "Green",
			}),
		]);

		expect(body).toBe(
			"- 💬 **Structure** — Nice split\n- ✅ **CI passes** — Green",
		);
	});

	it("keeps a multi-line comment inside its bullet", () => {
		const body = formatHighLevelReviewBody([
			item({
				status: "fail",
				title: "Tests",
				comment: "Missing cases:\nempty input\nnull input",
			}),
		]);

		expect(body).toBe(
			"- ❌ **Tests** — Missing cases:\n  empty input\n  null input",
		);
	});

	it("lists each queued comment with its file:lines after the checklist comments", () => {
		const body = formatHighLevelReviewBody(
			[item({ title: "Tests", comment: "Mostly fine" })],
			[
				{
					path: "src/a.test.ts",
					startLine: 12,
					endLine: 12,
					quote: "handles empty input",
					note: "Assert the error too\nnot just the count",
				},
				{
					path: "src/b.ts",
					startLine: 3,
					endLine: 5,
					quote: "works",
					note: "Redundant",
				},
			],
		);

		expect(body).toBe(
			[
				"- 💬 **Tests** — Mostly fine",
				"",
				"**Comments**",
				"",
				"- `src/a.test.ts:12` handles empty input: Assert the error too",
				"  not just the count",
				"- `src/b.ts:3-5` works: Redundant",
			].join("\n"),
		);
	});
});
