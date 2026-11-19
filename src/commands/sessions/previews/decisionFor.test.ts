import { describe, expect, it } from "vitest";
import type { PrPreview } from "../shared/SessionInfoBase";
import { decisionFor } from "./decisionFor";

function preview(kind: PrPreview["kind"], body = "body"): PrPreview {
	return { requestId: "r1", title: "Plan", body, prNumber: null, kind };
}

const form = JSON.stringify({
	questions: [
		{
			question: "Which?",
			header: "Pick",
			multiSelect: true,
			options: [
				{ label: "A", description: "" },
				{ label: "B", description: "" },
			],
		},
		{
			question: "Ship?",
			header: "Ship",
			multiSelect: false,
			options: [
				{ label: "Yes", description: "" },
				{ label: "No", description: "" },
			],
		},
	],
});

describe("decisionFor", () => {
	it("approves an ask with the note as a comment", () => {
		expect(decisionFor(preview("ask"), { approve: "go" })).toEqual({
			decision: "approve",
			comments: [{ quote: "Plan", note: "go" }],
		});
	});

	it("rejects a backlog proposal with a reason", () => {
		expect(decisionFor(preview("backlog-item"), { reject: "no" })).toEqual({
			decision: "reject",
			reason: "no",
		});
	});

	it.each([
		[{ approve: "fine" }, "works", "fine"],
		[{ reject: true as const }, "doesn't work", undefined],
	])("answers a manual check %o", (options, result, note) => {
		expect(decisionFor(preview("check"), options).answers).toEqual({
			result,
			...(note ? { note } : {}),
		});
	});

	it("answers each question by number or header, joining multi-select choices", () => {
		expect(
			decisionFor(preview("question", form), {
				answer: ["1=a", "pick=B", "ship=my own text"],
			}),
		).toEqual({
			decision: "approve",
			answers: { "Which?": "A, B", "Ship?": "my own text" },
		});
	});

	it.each([
		[{ answer: ["1=A"] }, "No answer for question 2: Ship?"],
		[
			{ answer: ["1=A", "2=Yes", "2=No"] },
			"Question 2 takes one answer: Ship?",
		],
		[{ answer: ["Yes"] }, 'Answer "Yes" names no question'],
		[{ approve: true as const }, "Answer a question form with --answer"],
	])("rejects question options %o", (options, message) => {
		expect(() => decisionFor(preview("question", form), options)).toThrow(
			message,
		);
	});

	it.each([
		[{}, "Pass --approve [note] or --reject [note]"],
		[{ approve: true as const, reject: true as const }, "not both"],
		[{ answer: ["x"] }, "--answer only applies to a question form"],
	])("rejects ask options %o", (options, message) => {
		expect(() => decisionFor(preview("ask"), options)).toThrow(message);
	});
});
