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
	it("returns the check verdict and trimmed note", () => {
		expect(
			paneEchoText(preview("check"), {
				answers: { result: "doesn't work", note: "  still blank  " },
			}),
		).toBe("Doesn't work\n\nstill blank");
	});

	it("returns just the verdict for a check without a note", () => {
		expect(
			paneEchoText(preview("check"), { answers: { result: "works" } }),
		).toBe("Works");
	});

	it("returns Rejected, the reason and each comment with its excerpt", () => {
		expect(
			paneEchoText(preview("ask"), {
				decision: "reject",
				reason: " Too vague ",
				comments: [{ quote: "line one\nline two", note: "Be specific" }],
			}),
		).toBe("Rejected\n\nToo vague\n\n> line one\n> line two\n\nBe specific");
	});

	it("returns Approved and comments on a propose preview", () => {
		expect(
			paneEchoText(preview("backlog-item"), {
				decision: "approve",
				comments: [{ quote: "Goal", note: "Add a test" }],
			}),
		).toBe("Approved\n\n> Goal\n\nAdd a test");
	});

	it.each(["ask", "rule", "design"] as const)(
		"returns Approved for a plain %s approve",
		(kind) => {
			expect(paneEchoText(preview(kind), { decision: "approve" })).toBe(
				"Approved",
			);
		},
	);

	it("returns Dismissed for a dismissed pane", () => {
		expect(
			paneEchoText(preview("ask"), {
				decision: "reject",
				reason: "x",
				dismissed: true,
			}),
		).toBe("Dismissed");
	});

	it("returns Dismissed for a dismissed question pane", () => {
		expect(
			paneEchoText(preview("question", questionBody), { decision: "reject" }),
		).toBe("Dismissed");
	});

	it("returns Dismissed and the note for a dismissed check pane", () => {
		expect(
			paneEchoText(preview("check"), {
				decision: "reject",
				answers: { note: " later today " },
			}),
		).toBe("Dismissed\n\nlater today");
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
