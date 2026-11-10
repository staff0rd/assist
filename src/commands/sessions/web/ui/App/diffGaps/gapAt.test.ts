import { describe, expect, it } from "vitest";
import { parseDiff } from "react-diff-view";
import { gapAt } from "./gapAt";

function hunksOf(patch: string) {
	return parseDiff(`--- a/f\n+++ b/f\n${patch}\n`)[0]?.hunks ?? [];
}

const change = (line: number, oldLines: number, newLines: number) =>
	`@@ -${line},${oldLines} +${line},${newLines} @@`;

const midFile = hunksOf(
	[
		change(30, 7, 7),
		" a",
		" b",
		" c",
		"-d",
		"+D",
		" e",
		" f",
		" g",
		change(60, 7, 8),
		" a",
		" b",
		" c",
		"+new",
		"-d",
		"+D",
		" e",
		" f",
		" g",
	].join("\n"),
);

describe("gapAt", () => {
	it("expands the top gap upward only when it is over the step", () => {
		expect(gapAt(midFile, 0)).toMatchObject({
			start: 1,
			end: 30,
			directions: ["up"],
		});
	});

	it("offers both directions between hunks over the step", () => {
		expect(gapAt(midFile, 1)?.directions).toEqual(["down", "up"]);
	});

	it("collapses to expand-all at 20 lines or fewer", () => {
		const hunks = hunksOf(
			[change(21, 3, 3), " a", "-b", "+B", " c"].join("\n"),
		);

		expect(gapAt(hunks, 0)).toMatchObject({ end: 21, directions: ["all"] });
	});

	it("has no top gap when the first hunk starts at line 1", () => {
		const hunks = hunksOf([change(1, 2, 2), "-a", "+A", " b"].join("\n"));

		expect(gapAt(hunks, 0)).toBeNull();
	});

	it("leaves the bottom gap's length unknown until the file has loaded", () => {
		expect(gapAt(midFile, 2)).toMatchObject({
			start: 67,
			end: null,
			directions: ["down"],
		});
	});

	it("counts the bottom gap in old lines once the file has loaded", () => {
		expect(gapAt(midFile, 2, 80)).toMatchObject({
			start: 67,
			end: 80,
			offset: 1,
		});
	});

	it("has no bottom gap when the last hunk has less than 3 lines of trailing context", () => {
		const hunks = hunksOf(
			[change(10, 3, 3), " a", " b", "-c", "+C"].join("\n"),
		);

		expect(gapAt(hunks, 1)).toBeNull();
	});
});
