import { describe, expect, it } from "vitest";
import { countReadingWords } from "./countReadingWords";

describe("countReadingWords", () => {
	describe("when the body is prose", () => {
		it("should count whitespace-separated words", () => {
			expect(countReadingWords("one two\nthree  four")).toEqual({
				prose: 4,
				code: 0,
			});
		});

		it("should ignore punctuation-only tokens", () => {
			expect(countReadingWords("a bullet — and a dash -")).toEqual({
				prose: 5,
				code: 0,
			});
		});

		it("should count an empty body as no words", () => {
			expect(countReadingWords("")).toEqual({ prose: 0, code: 0 });
		});
	});

	describe("when the body contains a fenced code block", () => {
		it("should count the fenced lines as code", () => {
			const body = [
				"Before the fence",
				"```ts",
				"const answer = 42;",
				"console.log(answer);",
				"```",
				"After the fence",
			].join("\n");

			expect(countReadingWords(body)).toEqual({ prose: 6, code: 4 });
		});

		it("should treat a tilde fence as code", () => {
			const body = ["~~~", "some code here", "~~~", "prose"].join("\n");

			expect(countReadingWords(body)).toEqual({ prose: 1, code: 3 });
		});

		it("should resume counting prose after the closing fence", () => {
			const body = ["```", "code", "```", "one two", "```", "more"].join("\n");

			expect(countReadingWords(body)).toEqual({ prose: 2, code: 2 });
		});
	});

	describe("when the body contains links and tags", () => {
		it("should count a bare URL as one word", () => {
			expect(
				countReadingWords("see https://example.com/a/b?c=d&e=f now"),
			).toEqual({ prose: 3, code: 0 });
		});

		it("should count an image as one word", () => {
			expect(
				countReadingWords("![a long alt description](https://img/x.png)"),
			).toEqual({ prose: 1, code: 0 });
		});

		it("should count an HTML tag as one word", () => {
			expect(
				countReadingWords('<img src="https://img/x.png" width="500">'),
			).toEqual({ prose: 1, code: 0 });
		});

		it("should count each tag of a wrapped HTML element separately", () => {
			expect(countReadingWords("<b>bold text</b>")).toEqual({
				prose: 4,
				code: 0,
			});
		});

		it("should count a URL inside a fenced block at the code rate", () => {
			const body = ["```", "curl https://example.com/a", "```"].join("\n");

			expect(countReadingWords(body)).toEqual({ prose: 0, code: 2 });
		});
	});
});
