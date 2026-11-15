import { describe, expect, it } from "vitest";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { paneEchoText } from "./paneEchoText";

function preview(kind: PrPreview["kind"], body = ""): PrPreview {
	return { requestId: "r1", title: "T", body, prNumber: null, kind };
}

const questionBody = JSON.stringify({
	questions: [
		{
			question: "Which colour?",
			header: "Colour",
			multiSelect: true,
			options: [
				{ label: "Red", description: "" },
				{ label: "Blue, dark", description: "" },
			],
		},
		{
			question: "Which size?",
			header: "Size",
			multiSelect: false,
			options: [
				{ label: "Small", description: "" },
				{ label: "Large", description: "" },
			],
		},
	],
});

describe("paneEchoText", () => {
	it("returns a trimmed check note", () => {
		expect(
			paneEchoText(preview("check"), {
				answers: { result: "works", note: "  fine  " },
			}),
		).toBe("fine");
	});

	it("returns nothing for a check without a note", () => {
		expect(
			paneEchoText(preview("check"), { answers: { result: "works" } }),
		).toBe("");
	});

	it("returns the reject reason and each comment with its excerpt", () => {
		expect(
			paneEchoText(preview("ask"), {
				decision: "reject",
				reason: " Too vague ",
				comments: [{ quote: "line one\nline two", note: "Be specific" }],
			}),
		).toBe("Too vague\n\n> line one\n> line two\n\nBe specific");
	});

	it("returns approve comments on a propose preview", () => {
		expect(
			paneEchoText(preview("backlog-item"), {
				decision: "approve",
				comments: [{ quote: "Goal", note: "Add a test" }],
			}),
		).toBe("> Goal\n\nAdd a test");
	});

	it("returns nothing for a plain approve", () => {
		expect(paneEchoText(preview("ask"), { decision: "approve" })).toBe("");
	});

	it("returns nothing for a dismissed pane", () => {
		expect(
			paneEchoText(preview("ask"), {
				decision: "reject",
				reason: "x",
				dismissed: true,
			}),
		).toBe("");
	});

	it("returns the picked labels and Other text of a question answer", () => {
		expect(
			paneEchoText(preview("question", questionBody), {
				answers: { "Which colour?": "Red, Blue, dark, Green please" },
			}),
		).toBe("Red, Blue, dark, Green please");
	});

	it("joins several answers in question order without headers", () => {
		expect(
			paneEchoText(preview("question", questionBody), {
				answers: { "Which size?": "Large", "Which colour?": "Teal" },
			}),
		).toBe("Teal\n\nLarge");
	});

	it("ignores other preview kinds", () => {
		expect(paneEchoText(preview("pr"), { reason: "nope" })).toBe("");
	});
});
