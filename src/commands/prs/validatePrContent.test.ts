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
});
