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

	describe("when the title references a backlog item", () => {
		it("should reject a bare id", () => {
			expect(() =>
				validatePrContent("Fix bug from a706", "A clean body"),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe("when the body references a backlog item", () => {
		it("should reject a bare id", () => {
			expect(() => validatePrContent("Fix bug", "Implements a706.")).toThrow(
				"process.exit",
			);
		});

		it("should reject a contextual phrase", () => {
			expect(() =>
				validatePrContent("Fix bug", "See backlog item a706 for context."),
			).toThrow("process.exit");
		});
	});

	describe("when content only resembles a backlog ref", () => {
		it("should pass data706", () => {
			expect(() =>
				validatePrContent("Add feature", "Processes data706 records."),
			).not.toThrow();
		});

		it("should pass a Jira key", () => {
			expect(() =>
				validatePrContent("Add feature", "Resolves BAD-671."),
			).not.toThrow();
		});

		it("should pass a bare hash number", () => {
			expect(() =>
				validatePrContent("Add feature", "Closes #42."),
			).not.toThrow();
		});

		it("should pass clean prose", () => {
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
