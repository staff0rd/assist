import { describe, expect, it, vi } from "vitest";
import type { AssistConfig } from "../../shared/types";
import { validateMessage } from "./validateMessage";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

const baseConfig = {} as AssistConfig;
const conventionalConfig = {
	commit: { conventional: true },
} as AssistConfig;

describe("validateMessage", () => {
	describe("when the message mentions claude", () => {
		it("should reject", () => {
			expect(() =>
				validateMessage("fix: use Claude suggestions", baseConfig),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe("when the message references a backlog item", () => {
		it("should reject a bare id", () => {
			expect(() => validateMessage("fix: bug from a706", baseConfig)).toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it("should reject a contextual phrase", () => {
			expect(() =>
				validateMessage("chore: backlog item a706", baseConfig),
			).toThrow("process.exit");
		});

		it("should not reject lookalikes", () => {
			expect(() =>
				validateMessage("fix: parse data706 rows", baseConfig),
			).not.toThrow();
		});
	});

	describe("when conventional commits are enabled", () => {
		describe("when the message follows the format", () => {
			it("should not reject", () => {
				expect(() =>
					validateMessage("feat: add feature", conventionalConfig),
				).not.toThrow();
			});

			it("should accept scoped messages", () => {
				expect(() =>
					validateMessage("fix(core): fix bug", conventionalConfig),
				).not.toThrow();
			});

			it("should accept breaking changes", () => {
				expect(() =>
					validateMessage("feat!: breaking change", conventionalConfig),
				).not.toThrow();
			});
		});

		describe("when the message does not follow the format", () => {
			it("should reject", () => {
				expect(() =>
					validateMessage("random message", conventionalConfig),
				).toThrow("process.exit");
			});
		});
	});

	describe("when the message exceeds max length", () => {
		it("should reject", () => {
			const longMessage = `feat: ${"a".repeat(50)}`;

			expect(() => validateMessage(longMessage, baseConfig)).toThrow(
				"process.exit",
			);
		});
	});

	describe("when the message is valid", () => {
		it("should not throw", () => {
			expect(() => validateMessage("fix: short msg", baseConfig)).not.toThrow();
		});
	});
});
