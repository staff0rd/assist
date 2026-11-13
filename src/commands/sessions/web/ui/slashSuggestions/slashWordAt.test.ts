import { describe, expect, it } from "vitest";
import { replaceSlashWord } from "./replaceSlashWord";
import { slashWordAt } from "./slashWordAt";

describe("slashWordAt", () => {
	it("finds a slash word at the start", () => {
		expect(slashWordAt("/re", 3)).toEqual({ start: 0, end: 3, query: "re" });
	});

	it("finds a slash word later in the reply", () => {
		const text = "ok, then /com";
		expect(slashWordAt(text, text.length)).toEqual({
			start: 9,
			end: 13,
			query: "com",
		});
	});

	it("queries up to the cursor but spans the whole word", () => {
		expect(slashWordAt("/commit now", 3)).toEqual({
			start: 0,
			end: 7,
			query: "co",
		});
	});

	it("starts a word after a newline", () => {
		expect(slashWordAt("hi\n/dr", 6)).toEqual({
			start: 3,
			end: 6,
			query: "dr",
		});
	});

	it("matches a bare slash with an empty query", () => {
		expect(slashWordAt("see /", 5)).toEqual({ start: 4, end: 5, query: "" });
	});

	it("ignores words that do not start with a slash", () => {
		expect(slashWordAt("a/b", 3)).toBeNull();
		expect(slashWordAt("/re ", 4)).toBeNull();
		expect(slashWordAt("", 0)).toBeNull();
	});
});

describe("replaceSlashWord", () => {
	it("replaces the word with the name and a trailing space", () => {
		const text = "ok, then /com";
		const word = slashWordAt(text, text.length);
		if (!word) throw new Error("no word");
		expect(replaceSlashWord(text, word, "commit")).toEqual({
			text: "ok, then /commit ",
			cursor: 17,
		});
	});

	it("replaces only the word at the cursor and keeps the rest", () => {
		const text = "/dr and /co more";
		const word = slashWordAt(text, 10);
		if (!word) throw new Error("no word");
		expect(replaceSlashWord(text, word, "commit")).toEqual({
			text: "/dr and /commit more",
			cursor: 16,
		});
	});
});
