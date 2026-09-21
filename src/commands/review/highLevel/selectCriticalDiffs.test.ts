import { describe, expect, it } from "vitest";
import { selectCriticalDiffs } from "./selectCriticalDiffs";
import type { HighLevelFile } from "./types";

function file(
	path: string,
	overrides: Partial<HighLevelFile> = {},
): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://github.com/org/repo/pull/1/files#diff-${path}`,
		patch: `@@ -1 +1 @@\n-old\n+new`,
		...overrides,
	};
}

const files = [
	file("src/app.ts"),
	file("api/schema.graphql"),
	file("en-AU/translation.json"),
];

describe("selectCriticalDiffs", () => {
	it("selects nothing when no critical paths are configured", () => {
		expect(selectCriticalDiffs(files, [])).toEqual([]);
	});

	it("selects only the files matching a critical glob", () => {
		expect(
			selectCriticalDiffs(files, [
				"**/*.graphql",
				"en-AU/translation.json",
			]).map((diff) => diff.path),
		).toEqual(["api/schema.graphql", "en-AU/translation.json"]);
	});

	it("carries the patch, status, counts and diff link", () => {
		expect(selectCriticalDiffs(files, ["**/*.graphql"])).toEqual([
			{
				path: "api/schema.graphql",
				status: "modified",
				additions: 1,
				deletions: 1,
				diffUrl:
					"https://github.com/org/repo/pull/1/files#diff-api/schema.graphql",
				patch: "@@ -1 +1 @@\n-old\n+new",
			},
		]);
	});

	it("reports a file GitHub gave no patch for as having none", () => {
		const [diff] = selectCriticalDiffs(
			[file("api/schema.graphql", { patch: undefined })],
			["**/*.graphql"],
		);

		expect(diff?.patch).toBeNull();
	});
});
