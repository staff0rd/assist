import { describe, expect, it } from "vitest";
import { countSloc } from "./countSloc";

describe("countSloc", () => {
	describe("when given code lines only", () => {
		it("should count all non-empty lines", () => {
			const code = "const a = 1;\nconst b = 2;\nreturn a + b;";

			expect(countSloc(code)).toBe(3);
		});
	});

	describe("when given empty lines", () => {
		it("should not count them", () => {
			const code = "const a = 1;\n\n\nconst b = 2;";

			expect(countSloc(code)).toBe(2);
		});
	});

	describe("when given single-line comments", () => {
		it("should not count them", () => {
			const code = "// this is a comment\nconst a = 1;";

			expect(countSloc(code)).toBe(1);
		});
	});

	describe("when given a multi-line comment on one line", () => {
		it("should not count it", () => {
			const code = "/* comment */\nconst a = 1;";

			expect(countSloc(code)).toBe(1);
		});

		describe("when there is code after the closing tag", () => {
			it("should count the line", () => {
				const code = "/* comment */ const a = 1;";

				expect(countSloc(code)).toBe(1);
			});
		});
	});

	describe("when given a multi-line comment spanning lines", () => {
		it("should not count the comment lines", () => {
			const code = "/*\n * comment\n */\nconst a = 1;";

			expect(countSloc(code)).toBe(1);
		});

		describe("when code follows the closing tag", () => {
			it("should count that line", () => {
				const code = "/*\n * comment\n */ const a = 1;";

				expect(countSloc(code)).toBe(1);
			});
		});
	});

	describe("when given an empty string", () => {
		it("should return zero", () => {
			expect(countSloc("")).toBe(0);
		});
	});

	describe("when given whitespace-only lines", () => {
		it("should not count them", () => {
			const code = "  \n\t\n  \t  ";

			expect(countSloc(code)).toBe(0);
		});
	});
});
