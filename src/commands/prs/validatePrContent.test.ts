import { describe, expect, it, vi } from "vitest";
import { validatePrContent } from "./validatePrContent";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

describe("validatePrContent", () => {
	describe("when the title mentions claude", () => {
		it("should reject", () => {
			expect(() =>
				validatePrContent("Add feature with Claude", "A clean body"),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe("when the body mentions claude", () => {
		it("should reject", () => {
			expect(() =>
				validatePrContent(
					"Add feature",
					"Generated with [Claude Code](https://claude.com/claude-code)",
				),
			).toThrow("process.exit");
		});

		it("should reject regardless of case", () => {
			expect(() =>
				validatePrContent("Add feature", "co-authored-by: CLAUDE"),
			).toThrow("process.exit");
		});
	});

	describe("when the title and body are clean", () => {
		it("should not throw", () => {
			expect(() =>
				validatePrContent("Add feature", "Adds the feature."),
			).not.toThrow();
		});
	});

	describe("paragraph length", () => {
		it("should pass short prose", () => {
			expect(() =>
				validatePrContent(
					"Add feature",
					"## What\n\nAdds a new endpoint for fetching user preferences.",
				),
			).not.toThrow();
		});

		it("should pass a long bulleted list", () => {
			const bullets = Array.from(
				{ length: 30 },
				(_, i) =>
					`- Item ${i} describing a change made to the system in some detail to pad length`,
			).join("\n");
			expect(() =>
				validatePrContent("Add feature", `## What\n\n${bullets}`),
			).not.toThrow();
		});

		it("should reject a long paragraph", () => {
			const longParagraph = "This sentence describes some change. ".repeat(20);
			expect(() =>
				validatePrContent("Add feature", `## What\n\n${longParagraph}`),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});
});
