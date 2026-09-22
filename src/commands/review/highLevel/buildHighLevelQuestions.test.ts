import { describe, expect, it } from "vitest";
import { buildHighLevelQuestions } from "./buildHighLevelQuestions";

const unset = { criticalPaths: [], uiPaths: [], descriptionWordCap: 300 };

function suggestionFor(
	questions: ReturnType<typeof buildHighLevelQuestions>,
	key: string,
): string | undefined {
	return questions.find((question) => question.key === key)?.suggest;
}

describe("buildHighLevelQuestions", () => {
	it("asks for all three keys", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: [],
			uiPaths: [],
		});

		expect(questions.map((question) => question.key)).toEqual([
			"review.highLevel.criticalPaths",
			"review.highLevel.uiPaths",
			"review.highLevel.descriptionWordCap",
		]);
	});

	it("suggests the proposed globs while the key is unset", () => {
		const questions = buildHighLevelQuestions(unset, {
			criticalPaths: ["**/*.graphql", "src/schema/**"],
			uiPaths: ["src/ui/**"],
		});

		expect(suggestionFor(questions, "review.highLevel.criticalPaths")).toBe(
			"**/*.graphql,src/schema/**",
		);
		expect(suggestionFor(questions, "review.highLevel.uiPaths")).toBe(
			"src/ui/**",
		);
	});

	it("suggests the configured globs over the proposed ones", () => {
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
			suggestionFor(questions, "review.highLevel.criticalPaths"),
		).toBeUndefined();
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
