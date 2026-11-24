import { describe, expect, it } from "vitest";
import type {
	HighLevelTestChangeKind,
	HighLevelTestFile,
	HighLevelTestNode,
} from "../../../../../../../review/highLevel/types";
import { highLevelTestChangeSummary } from "./highLevelTestChangeSummary";

function file(tests: HighLevelTestNode[]): HighLevelTestFile {
	return {
		path: "a.test.ts",
		status: "modified",
		additions: 1,
		deletions: 0,
		diffUrl: "",
		tests,
	};
}

function test(
	name: string,
	change?: HighLevelTestChangeKind,
): HighLevelTestNode {
	return {
		kind: "it",
		id: name,
		name,
		line: 1,
		...(change ? { change } : {}),
	};
}

describe("highLevelTestChangeSummary", () => {
	it("counts added, deleted and modified tests, including those inside describes", () => {
		const summary = highLevelTestChangeSummary([
			file([
				test("a", "added"),
				{
					kind: "describe",
					name: "suite",
					line: 2,
					children: [
						test("b", "modified"),
						test("c", "added"),
						test("d", "removed"),
					],
				},
			]),
		]);

		expect(summary).toBe(
			"2 added · 1 deleted · 1 modified · unchanged tests are not listed",
		);
	});

	it("falls back to a plain count when no test carries a change", () => {
		expect(highLevelTestChangeSummary([file([test("a")])])).toBe(
			"1 test in changed files",
		);
	});
});
