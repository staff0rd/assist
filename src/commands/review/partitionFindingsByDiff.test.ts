import { describe, expect, it } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";
import { partitionFindingsByDiff } from "./partitionFindingsByDiff";

function finding(over: Partial<LineBoundFinding>): LineBoundFinding {
	return {
		title: "t",
		severity: "blocker",
		source: "confirmed",
		location: "f:1",
		impact: "",
		recommendation: "",
		file: "src/foo.ts",
		line: 1,
		...over,
	};
}

const index = new Map<string, Set<number>>([
	["src/foo.ts", new Set([10, 11, 12])],
]);

describe("partitionFindingsByDiff", () => {
	it("keeps findings whose line is in the diff", () => {
		const { inDiff, outOfDiff } = partitionFindingsByDiff(
			[finding({ line: 11 })],
			index,
		);
		expect(inDiff).toHaveLength(1);
		expect(outOfDiff).toHaveLength(0);
	});

	it("rejects findings whose line is outside the diff", () => {
		const { inDiff, outOfDiff } = partitionFindingsByDiff(
			[finding({ line: 376 })],
			index,
		);
		expect(inDiff).toHaveLength(0);
		expect(outOfDiff).toHaveLength(1);
	});

	it("rejects findings on untouched files", () => {
		const { outOfDiff } = partitionFindingsByDiff(
			[finding({ file: "src/other.ts", line: 10 })],
			index,
		);
		expect(outOfDiff).toHaveLength(1);
	});

	it("rejects a multi-line finding whose startLine is outside the diff", () => {
		const { outOfDiff } = partitionFindingsByDiff(
			[finding({ startLine: 5, line: 11 })],
			index,
		);
		expect(outOfDiff).toHaveLength(1);
	});

	it("keeps a multi-line finding fully inside the diff", () => {
		const { inDiff } = partitionFindingsByDiff(
			[finding({ startLine: 10, line: 12 })],
			index,
		);
		expect(inDiff).toHaveLength(1);
	});
});
