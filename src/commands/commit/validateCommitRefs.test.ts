import { describe, expect, it, vi } from "vitest";
import { validateCommitRefs } from "./validateCommitRefs";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});

describe("validateCommitRefs", () => {
	describe("when there are no refs", () => {
		it("should not throw", () => {
			expect(() => validateCommitRefs([])).not.toThrow();
		});
	});

	describe("when a ref contains a URL", () => {
		it("should accept a bare https URL", () => {
			expect(() => validateCommitRefs(["https://example.com/a"])).not.toThrow();
		});

		it("should accept a bare http URL", () => {
			expect(() => validateCommitRefs(["http://example.com/a"])).not.toThrow();
		});

		it("should accept a URL mid-sentence", () => {
			expect(() =>
				validateCommitRefs([
					"see https://example.com/a for the rationale, then move on",
				]),
			).not.toThrow();
		});

		it("should accept every ref when several are given", () => {
			expect(() =>
				validateCommitRefs([
					"https://example.com/a",
					"why https://example.com/b",
				]),
			).not.toThrow();
		});
	});

	describe("when a ref contains no URL", () => {
		it("should reject and name the offending value", () => {
			expect(() => validateCommitRefs(["rationale for removing it"])).toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockError).toHaveBeenCalledWith(
				'Error: --ref must contain an http or https URL (got: "rationale for removing it")',
			);
		});

		it("should reject an empty value", () => {
			expect(() => validateCommitRefs([""])).toThrow("process.exit");
			expect(mockError).toHaveBeenCalledWith(
				'Error: --ref must contain an http or https URL (got: "")',
			);
		});

		it("should reject a scheme with nothing after it", () => {
			expect(() => validateCommitRefs(["https://"])).toThrow("process.exit");
		});

		it("should reject a URL-like value with no scheme", () => {
			expect(() => validateCommitRefs(["example.com/a"])).toThrow(
				"process.exit",
			);
		});

		it("should name the offending value when an earlier ref is valid", () => {
			expect(() =>
				validateCommitRefs(["https://example.com/a", "no url here"]),
			).toThrow("process.exit");
			expect(mockError).toHaveBeenCalledWith(
				'Error: --ref must contain an http or https URL (got: "no url here")',
			);
		});
	});
});
