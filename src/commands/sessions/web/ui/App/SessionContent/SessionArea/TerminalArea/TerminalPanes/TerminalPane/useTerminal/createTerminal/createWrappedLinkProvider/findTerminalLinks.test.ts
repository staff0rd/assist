import { describe, expect, it } from "vitest";
import { type BufferLineInfo, findTerminalLinks } from "./findTerminalLinks";

function reader(lines: BufferLineInfo[]) {
	return (index: number): BufferLineInfo | undefined => lines[index];
}

function line(
	text: string,
	{ isWrapped = false, isFull = false } = {},
): BufferLineInfo {
	return { text, isWrapped, isFull };
}

describe("findTerminalLinks", () => {
	describe("when a url fits on a single line", () => {
		it("detects the url with a range on that line", () => {
			const links = findTerminalLinks(
				reader([line("see https://example.com here")]),
				1,
			);

			expect(links).toEqual([
				{
					text: "https://example.com",
					range: { start: { x: 5, y: 1 }, end: { x: 23, y: 1 } },
				},
			]);
		});

		it("excludes trailing interpunction from the match", () => {
			const links = findTerminalLinks(
				reader([line("https://example.com.")]),
				1,
			);

			expect(links[0]?.text).toBe("https://example.com");
		});
	});

	describe("when a url soft-wraps across two lines", () => {
		const full = `https://example.com/${"a".repeat(100)}${"b".repeat(30)}`;
		const lines = [
			line(full.slice(0, 120), { isFull: true }),
			line(full.slice(120), { isWrapped: true }),
		];

		it("detects the whole url as one link spanning both rows", () => {
			const links = findTerminalLinks(reader(lines), 1);

			expect(links).toEqual([
				{
					text: full,
					range: { start: { x: 1, y: 1 }, end: { x: 30, y: 2 } },
				},
			]);
		});

		it("detects the same link when the continuation row is queried", () => {
			expect(findTerminalLinks(reader(lines), 2)).toEqual(
				findTerminalLinks(reader(lines), 1),
			);
		});
	});

	describe("when a program hard-wraps a url at the right margin", () => {
		const full = `https://example.com/${"a".repeat(100)}${"b".repeat(30)}`;
		const lines = [
			line(full.slice(0, 120), { isFull: true }),
			line(full.slice(120), { isWrapped: false }),
		];

		it("joins the margin-filled line into a single link", () => {
			const links = findTerminalLinks(reader(lines), 1);

			expect(links[0]?.text).toBe(full);
			expect(links[0]?.range.end).toEqual({ x: 30, y: 2 });
		});
	});

	describe("when two urls sit on consecutive unfilled lines", () => {
		const lines = [
			line("https://a.example.com"),
			line("https://b.example.com"),
		];

		it("keeps them as separate links rather than joining", () => {
			expect(findTerminalLinks(reader(lines), 1)[0]?.text).toBe(
				"https://a.example.com",
			);
			expect(findTerminalLinks(reader(lines), 2)[0]?.text).toBe(
				"https://b.example.com",
			);
		});
	});

	describe("when the line has no url", () => {
		it("returns no links", () => {
			expect(
				findTerminalLinks(reader([line("just some plain text")]), 1),
			).toEqual([]);
		});

		it("ignores non-http schemes", () => {
			expect(
				findTerminalLinks(reader([line("ftp://example.com/file")]), 1),
			).toEqual([]);
		});
	});

	describe("when the queried line does not exist", () => {
		it("returns no links", () => {
			expect(findTerminalLinks(reader([]), 1)).toEqual([]);
		});
	});
});
