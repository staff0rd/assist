import { describe, expect, it } from "vitest";
import { buildCommitMessage } from "./buildCommitMessage";

describe("buildCommitMessage", () => {
	describe("when there are no refs", () => {
		it("should return the subject unchanged", () => {
			expect(buildCommitMessage("fix: short msg", [])).toBe("fix: short msg");
		});
	});

	describe("when there is one ref", () => {
		it("should append a blank line and a single trailer", () => {
			expect(
				buildCommitMessage("fix: short msg", [
					"rationale https://example.com/a",
				]),
			).toBe("fix: short msg\n\nRef: rationale https://example.com/a");
		});

		it("should carry the value verbatim, including commas", () => {
			expect(
				buildCommitMessage("fix: short msg", [
					"first, second, third https://example.com/a",
				]),
			).toBe(
				"fix: short msg\n\nRef: first, second, third https://example.com/a",
			);
		});
	});

	describe("when there are several refs", () => {
		it("should emit one trailer per ref in the order given", () => {
			expect(
				buildCommitMessage("fix: short msg", [
					"https://example.com/a",
					"why https://example.com/b",
					"https://example.com/c",
				]),
			).toBe(
				"fix: short msg\n\nRef: https://example.com/a\nRef: why https://example.com/b\nRef: https://example.com/c",
			);
		});
	});
});
