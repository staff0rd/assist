// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildHighLevelStructure } from "../../../../../../review/highLevel/buildHighLevelStructure";
import type {
	HighLevelFile,
	HighLevelSlice,
	HighLevelTestFile,
} from "../../../../../../review/highLevel/types";
import { HighLevelSlicedStructureView } from "./HighLevelSlicedStructureView";
import { HighLevelSliceTestLinks } from "./HighLevelSliceTestLinks";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function file(path: string, patch = "@@ -1 +1 @@\n-old\n+new"): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://example.test/${path}`,
		patch,
	};
}

function slice(title: string, hunks: string[]): HighLevelSlice {
	return {
		title,
		summary: `About ${title}.`,
		hunks,
		additions: 1,
		deletions: 1,
	};
}

const structure = buildHighLevelStructure([
	file("src/a.ts"),
	file(
		"src/b.ts",
		"@@ -1,4 +1,4 @@\n-old\n+new\n c1\n c2\n c3\n@@ -40,1 +40,1 @@\n-x\n+y",
	),
	file("src/a.test.ts"),
	file("package.json"),
]);

const tests: HighLevelTestFile[] = [
	{
		path: "src/a.test.ts",
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: "",
		tests: [
			{
				kind: "it",
				id: "t1",
				name: "swaps old for new",
				line: 1,
				change: "added",
			},
		],
	},
];

const slices = [
	slice("Change a", ["src/a.ts#0", "src/b.ts#0", "src/a.test.ts#0"]),
	slice("Everything else", ["src/b.ts#1", "package.json#0"]),
];

describe("HighLevelSlicedStructureView", () => {
	it("draws each slice's files, split tags and its tests, without test files in the tree", () => {
		render(
			<HighLevelSlicedStructureView
				subject="sliced-test"
				collapsedPaths={[]}
				structure={structure}
				slices={slices}
				tests={tests}
			/>,
		);

		expect(screen.getByText(/^2 slices ·/)).toBeTruthy();
		const first = screen.getByRole("region", { name: "Slice 1: Change a" });
		expect(within(first).getByText("About Change a.")).toBeTruthy();
		expect(within(first).getByText("a.ts")).toBeTruthy();
		expect(within(first).queryByText("a.test.ts")).toBeNull();
		expect(within(first).getByText("1 of 2 hunks")).toBeTruthy();
		expect(within(first).getByText("swaps old for new")).toBeTruthy();
		expect(
			within(first).getByText(/the hunk at @@ -40,1 \+40,1 @@ is in slice 2/),
		).toBeTruthy();

		const second = screen.getByRole("region", {
			name: "Slice 2: Everything else",
		});
		expect(within(second).getByText("package.json")).toBeTruthy();
		expect(within(second).queryByText("a.ts")).toBeNull();
		expect(within(second).getByText("1 of 2 hunks")).toBeTruthy();
		expect(
			within(second).getByText("No changed tests in this slice."),
		).toBeTruthy();
	});

	it("lists each slice with its test count in the Tests item", () => {
		render(<HighLevelSliceTestLinks slices={slices} tests={tests} />);

		expect(screen.getByText("1 Change a · 1 test")).toBeTruthy();
		expect(screen.getByText("2 Everything else · 0 tests")).toBeTruthy();
	});
});
