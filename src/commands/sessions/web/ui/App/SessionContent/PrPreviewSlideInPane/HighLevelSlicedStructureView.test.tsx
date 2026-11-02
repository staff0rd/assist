// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildHighLevelStructure } from "../../../../../../review/highLevel/buildHighLevelStructure";
import type { HighLevelFile } from "../../../../../../review/highLevel/types";
import { HighLevelSlicedStructureView } from "./HighLevelSlicedStructureView";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function file(path: string): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://example.test/${path}`,
		patch: "@@ -1 +1 @@\n-old\n+new",
	};
}

const structure = buildHighLevelStructure([
	file("src/a.ts"),
	file("src/b.ts"),
	file("package.json"),
]);

describe("HighLevelSlicedStructureView", () => {
	it("draws a numbered section per slice holding only that slice's files", () => {
		render(
			<HighLevelSlicedStructureView
				subject="sliced-test"
				collapsedPaths={[]}
				structure={structure}
				slices={[
					{
						title: "Change a",
						summary: "Swaps old for new in a.",
						hunks: ["src/a.ts#0"],
						additions: 1,
						deletions: 1,
					},
					{
						title: "Everything else",
						summary: "Hunks no slice claimed.",
						hunks: ["src/b.ts#0", "package.json#0"],
						additions: 2,
						deletions: 2,
					},
				]}
			/>,
		);

		expect(screen.getByText(/^2 slices ·/)).toBeTruthy();
		const first = screen.getByRole("region", { name: "Slice 1: Change a" });
		expect(within(first).getByText("Swaps old for new in a.")).toBeTruthy();
		expect(within(first).getByText("a.ts")).toBeTruthy();
		expect(within(first).queryByText("b.ts")).toBeNull();
		const second = screen.getByRole("region", {
			name: "Slice 2: Everything else",
		});
		expect(within(second).getByText("package.json")).toBeTruthy();
		expect(within(second).queryByText("a.ts")).toBeNull();
	});
});
