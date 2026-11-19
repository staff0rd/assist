import { describe, expect, it } from "vitest";
import { formatPreview } from "./formatPreview";

describe("formatPreview", () => {
	it("lists a question form's options", () => {
		const body = JSON.stringify({
			questions: [
				{
					question: "Which?",
					context: "Why",
					header: "Pick",
					multiSelect: true,
					options: [
						{ label: "A", description: "first" },
						{ label: "B", description: "" },
					],
				},
			],
		});
		expect(
			formatPreview({
				requestId: "r",
				title: "Asking",
				body,
				prNumber: null,
				kind: "question",
			}),
		).toEqual([
			"Kind: question",
			"Title: Asking",
			"",
			"1. [Pick] Which? (choose any)",
			"   Why",
			"   - A: first",
			"   - B",
		]);
	});

	it("numbers a manual check's steps", () => {
		const body = JSON.stringify({
			title: "T",
			steps: ["Open it"],
			changed: "X",
		});
		expect(
			formatPreview({
				requestId: "r",
				title: "T",
				body,
				prNumber: null,
				kind: "check",
			}),
		).toEqual(["Kind: check", "Title: T", "", "Changed: X", "1. Open it"]);
	});

	it("prints other bodies as-is", () => {
		expect(
			formatPreview({ requestId: "r", title: "T", body: "md", prNumber: null }),
		).toEqual(["Kind: pr", "Title: T", "", "md"]);
	});
});
