import { describe, expect, it } from "vitest";
import { checkStoryScreenshots } from "./checkStoryScreenshots";
import { parseStoryMappings } from "./parseStoryMappings";

const declared = new Set(["panel.png", "panel-dark.png", "rules.png"]);
const changed = new Set(["panel.png", "panel-dark.png"]);

function check(uiStoryIds: number[], story: string[]) {
	return checkStoryScreenshots({
		uiStoryIds,
		mappings: parseStoryMappings(story),
		declared,
		changed,
	});
}

describe("checkStoryScreenshots", () => {
	it("passes when every UI story maps to a declared, changed screenshot", () => {
		expect(
			check([1642, 955], ["a1642=panel.png", "955=panel-dark.png"]),
		).toEqual([]);
	});

	it("names every unmapped UI story", () => {
		const problems = check([1642, 955, 7], ["a1642=panel.png"]);

		expect(problems).toHaveLength(2);
		expect(problems[0]).toContain("a955 has no screenshot");
		expect(problems[1]).toContain("a7 has no screenshot");
	});

	it("fails a story mapped to a file no docs page declares", () => {
		expect(check([1642], ["a1642=missing.png"])).toEqual([
			"a1642: missing.png is not declared in any docs page's screenshots",
		]);
	});

	it("fails a story mapped to a declared screenshot whose PNG is unchanged", () => {
		const problems = check([1642], ["a1642=rules.png"]);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain("rules.png was not added or recaptured");
	});

	it("passes with no UI stories and no mappings", () => {
		expect(check([], [])).toEqual([]);
	});

	it("fails a mapping for a story that is not a covered UI story", () => {
		expect(check([], ["a1663=panel.png"])).toEqual([
			"a1663 is not a covered UI story",
		]);
	});

	it("accepts a mapping given as a screenshot path", () => {
		expect(check([1642], ["a1642=some/dir/panel.png"])).toEqual([]);
	});
});

describe("parseStoryMappings", () => {
	it("collects repeated mappings per story", () => {
		expect(parseStoryMappings(["a1=x.png", "1=y.png", "a2=z.png"])).toEqual(
			new Map([
				[1, ["x.png", "y.png"]],
				[2, ["z.png"]],
			]),
		);
	});

	it("rejects a mapping without a file", () => {
		expect(() => parseStoryMappings(["a1"])).toThrow("<id>=<file.png>");
		expect(() => parseStoryMappings(["a1="])).toThrow("<id>=<file.png>");
	});
});
