import { describe, expect, it } from "vitest";
import { defaultCriticalPaths } from "../../../shared/defaultCriticalPaths";
import { buildHighLevelQuestions } from "./buildHighLevelQuestions";

const unset = {
	criticalPaths: undefined,
	uiPaths: [],
	descriptionWordCap: 300,
	testPaths: [],
	collapsedPaths: [],
	requireLinkedIssue: true,
};

function suggestionFor(
	questions: ReturnType<typeof buildHighLevelQuestions>,
	key: string,
): string | undefined {
	return questions.find((question) => question.key === key)?.suggest;
}

describe("buildHighLevelQuestions", () => {
	it("asks for all four keys", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: [],
			uiPaths: [],
		});

		expect(questions.map((question) => question.key)).toEqual([
			"review.highLevel.criticalPaths",
			"review.highLevel.uiPaths",
			"review.highLevel.descriptionWordCap",
			"review.highLevel.collapsedPaths",
		]);
	});

	it("suggests the proposed globs while the key is unset", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: [],
			uiPaths: ["src/ui/**"],
		});

		expect(suggestionFor(questions, "review.highLevel.uiPaths")).toBe(
			"src/ui/**",
		);
	});

	it("merges the default critical paths with the proposed ones while unset", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: ["**/package.json", "src/schema/**"],
			uiPaths: [],
		});

		expect(suggestionFor(questions, "review.highLevel.criticalPaths")).toBe(
			[...defaultCriticalPaths, "src/schema/**"].join(","),
		);
	});

	it("suggests the default critical paths when nothing is proposed", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: [],
			uiPaths: [],
		});

		expect(suggestionFor(questions, "review.highLevel.criticalPaths")).toBe(
			defaultCriticalPaths.join(","),
		);
	});

	it("suggests the configured critical paths over defaults and proposals", () => {
		const questions = buildHighLevelQuestions(
			{ ...unset, criticalPaths: ["en-AU/translation.json"] },
			{ criticalPaths: ["**/*.graphql"], uiPaths: [] },
		);

		expect(suggestionFor(questions, "review.highLevel.criticalPaths")).toBe(
			"en-AU/translation.json",
		);
	});

	it("suggests nothing for a key with neither a value nor a proposal", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: [],
			uiPaths: [],
		});

		expect(
			suggestionFor(questions, "review.highLevel.uiPaths"),
		).toBeUndefined();
	});

	it("suggests the collapsed paths in force", () => {
		const questions = buildHighLevelQuestions(
			{ ...unset, collapsedPaths: ["**/*.test.*", "**/generated/**"] },
			{ criticalPaths: [], uiPaths: [] },
		);

		expect(suggestionFor(questions, "review.highLevel.collapsedPaths")).toBe(
			"**/*.test.*,**/generated/**",
		);
	});

	it("suggests the word cap in force, default or not", () => {
		const questions = buildHighLevelQuestions(
			{ ...unset, descriptionWordCap: 250 },
			{ criticalPaths: [], uiPaths: [] },
		);

		expect(
			suggestionFor(questions, "review.highLevel.descriptionWordCap"),
		).toBe("250");
	});
});
