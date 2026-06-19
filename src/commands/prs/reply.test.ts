import { describe, expect, it, vi } from "vitest";
import { reply } from "./reply";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

describe("reply", () => {
	describe("when the body mentions claude", () => {
		it("should reject", () => {
			expect(() => reply(123, "Fixed by Claude")).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it("should reject regardless of case", () => {
			expect(() => reply(123, "done by CLAUDE")).toThrow("process.exit");
		});
	});

	describe("when the body mentions opus", () => {
		it("should reject", () => {
			expect(() => reply(123, "addressed by Opus")).toThrow("process.exit");
		});

		it("should reject regardless of case", () => {
			expect(() => reply(123, "addressed by OPUS")).toThrow("process.exit");
		});
	});
});
