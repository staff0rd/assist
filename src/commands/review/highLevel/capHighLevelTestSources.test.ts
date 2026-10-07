import { describe, expect, it } from "vitest";
import { capHighLevelTestSources } from "./capHighLevelTestSources";
import type { HighLevelTestCase, HighLevelTestFile } from "./types";

function test(line: number, lines: number): HighLevelTestCase {
	return {
		kind: "it",
		id: `a.test.ts:${line}`,
		name: `t${line}`,
		line,
		source: Array(lines).fill("x").join("\n"),
	};
}

function file(tests: HighLevelTestCase[]): HighLevelTestFile {
	return {
		path: "a.test.ts",
		status: "added",
		additions: 1,
		deletions: 0,
		diffUrl: "u",
		tests,
	};
}

describe("capHighLevelTestSources", () => {
	it("keeps sources inside the budget untouched", () => {
		const files = [file([test(1, 10)])];

		expect(capHighLevelTestSources(files)).toEqual(files);
	});

	it("drops a source past the per-test cap and marks it truncated", () => {
		const [capped] = capHighLevelTestSources([file([test(1, 500)])]);

		expect(capped?.tests[0]).toEqual({
			kind: "it",
			id: "a.test.ts:1",
			name: "t1",
			line: 1,
			truncated: true,
		});
	});

	it("stops shipping sources once the review-wide budget is spent", () => {
		const tests = Array.from({ length: 30 }, (_, i) => test(i, 200));
		const [capped] = capHighLevelTestSources([file(tests)]);
		const shipped = capped?.tests.filter(
			(node) => node.kind === "it" && node.source !== undefined,
		);

		expect(shipped).toHaveLength(25);
	});
});
