import { describe, expect, it } from "vitest";
import { formatAskQuestionAnswers } from "./formatAskQuestionAnswers";

const questions = [
	{
		question: "Pick?",
		header: "Pick",
		multiSelect: false,
		options: [
			{ label: "A (Recommended)", description: "" },
			{ label: "B", description: "" },
		],
	},
];

describe("formatAskQuestionAnswers", () => {
	it("says the user answered by default", () => {
		expect(formatAskQuestionAnswers(questions, { "Pick?": "B" })).toMatch(
			/^User has answered your questions: "Pick\?"="B"/,
		);
	});

	it("says yolo mode answered when the decision came from yolo", () => {
		expect(
			formatAskQuestionAnswers(
				questions,
				{ "Pick?": "A (Recommended)" },
				"yolo",
			),
		).toMatch(
			/^Yolo mode answered your questions .*"Pick\?"="A \(Recommended\)"/,
		);
	});

	it("tells the agent autopilot's answers stand for the user's, completion included", () => {
		expect(
			formatAskQuestionAnswers(questions, { "Pick?": "A" }, "autopilot"),
		).toContain(
			"treat these as the user's own answers, including any approval or instruction to complete",
		);
	});
});
