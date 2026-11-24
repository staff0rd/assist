import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { formatHighLevelTests } from "./formatHighLevelTests";
import type { HighLevelTestCase } from "./types";

function test(
	name: string,
	change: HighLevelTestCase["change"],
): HighLevelTestCase {
	return { kind: "it", id: name, name, line: 1, change };
}

describe("formatHighLevelTests", () => {
	it("marks added, deleted and modified tests with A, D and M", () => {
		chalk.level = 0;
		const output = formatHighLevelTests(
			[
				{
					path: "a.test.ts",
					status: "modified",
					additions: 1,
					deletions: 1,
					diffUrl: "#",
					tests: [
						{
							kind: "describe",
							name: "suite",
							line: 1,
							children: [
								test("old", "removed"),
								test("new", "added"),
								test("edited", "modified"),
							],
						},
					],
				},
			],
			["**/*.test.ts"],
		);

		expect(output.split("\n").slice(3)).toEqual([
			"    suite",
			"      D old",
			"      A new",
			"      M edited",
		]);
	});
});
