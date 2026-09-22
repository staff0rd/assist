import { describe, expect, it, vi } from "vitest";
import {
	answersCoverEveryKey,
	parseConfigureAnswers,
} from "./parseConfigureAnswers";

describe("parseConfigureAnswers", () => {
	it("reads each key=value answer", () => {
		expect(
			parseConfigureAnswers([
				"review.highLevel.criticalPaths=**/*.graphql,src/schema/**",
				"review.highLevel.descriptionWordCap=250",
			]),
		).toEqual({
			"review.highLevel.criticalPaths": "**/*.graphql,src/schema/**",
			"review.highLevel.descriptionWordCap": "250",
		});
	});

	it("keeps an empty value, which leaves the key unset", () => {
		expect(parseConfigureAnswers(["review.highLevel.uiPaths="])).toEqual({
			"review.highLevel.uiPaths": "",
		});
	});

	it("keeps the = signs inside a glob", () => {
		expect(
			parseConfigureAnswers(["review.highLevel.uiPaths=src/**/*=v2*"]),
		).toEqual({ "review.highLevel.uiPaths": "src/**/*=v2*" });
	});

	it("exits on an answer that is not key=value", () => {
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		parseConfigureAnswers(["**/*.graphql"]);

		expect(exit).toHaveBeenCalledWith(1);
		vi.restoreAllMocks();
	});

	it("exits on a key the checklist does not configure", () => {
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		parseConfigureAnswers(["review.codexModel=gpt-5-codex"]);

		expect(exit).toHaveBeenCalledWith(1);
		vi.restoreAllMocks();
	});
});

describe("answersCoverEveryKey", () => {
	it("is true only once all three keys are answered", () => {
		const answers = {
			"review.highLevel.criticalPaths": "**/*.graphql",
			"review.highLevel.uiPaths": "",
		};

		expect(answersCoverEveryKey(answers)).toBe(false);
		expect(
			answersCoverEveryKey({
				...answers,
				"review.highLevel.descriptionWordCap": "300",
			}),
		).toBe(true);
	});
});
