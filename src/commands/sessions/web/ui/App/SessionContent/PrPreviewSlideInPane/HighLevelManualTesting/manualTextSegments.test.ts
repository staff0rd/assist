import { describe, expect, it } from "vitest";
import { manualTextSegments } from "./manualTextSegments";

const BLOB = "https://github.com/org/repo/blob/abc";

describe("manualTextSegments", () => {
	it("links URLs as given, without trailing punctuation", () => {
		expect(
			manualTextSegments(
				"Open http://localhost:3000/x?y=1.",
				"org/repo",
				"abc",
			),
		).toEqual([
			{ text: "Open ", code: false },
			{
				text: "http://localhost:3000/x?y=1",
				code: false,
				href: "http://localhost:3000/x?y=1",
			},
			{ text: ".", code: false },
		]);
	});

	it("links repo paths to the file at the head SHA, inside or outside code", () => {
		expect(
			manualTextSegments(
				"Edit src/a/b.ts then `cat docs/x.md`",
				"org/repo",
				"abc",
			),
		).toEqual([
			{ text: "Edit ", code: false },
			{ text: "src/a/b.ts", code: false, href: `${BLOB}/src/a/b.ts` },
			{ text: " then ", code: false },
			{ text: "cat ", code: true },
			{ text: "docs/x.md", code: true, href: `${BLOB}/docs/x.md` },
		]);
	});

	it("leaves home and absolute paths and bare words unlinked", () => {
		const segments = manualTextSegments(
			"Read ~/.assist/daemon.log or /tmp/a.txt and package.json",
			"org/repo",
			"abc",
		);
		expect(segments.every((segment) => !segment.href)).toBe(true);
	});
});
