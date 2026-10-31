import { describe, expect, it } from "vitest";
import { splitHtml } from "./splitHtml";

describe("splitHtml", () => {
	it("splits unmatched tags from balanced runs", () => {
		expect(
			splitHtml('</article>\n<article class="card">\n<h3>A</h3><br><p>B</p>'),
		).toEqual([
			{ kind: "close", text: "</article>", tag: "article" },
			{ kind: "space", text: "\n" },
			{ kind: "open", text: '<article class="card">', tag: "article" },
			{ kind: "run", text: "\n<h3>A</h3><br><p>B</p>" },
		]);
	});

	it("splits balanced elements that span lines", () => {
		expect(splitHtml("<p>A</p>\n<div>\n<b>B</b>\n</div>")).toEqual([
			{ kind: "run", text: "<p>A</p>\n" },
			{ kind: "open", text: "<div>", tag: "div" },
			{ kind: "run", text: "\n<b>B</b>\n" },
			{ kind: "close", text: "</div>", tag: "div" },
		]);
	});

	it("keeps self-closing tags and comments inside runs", () => {
		expect(splitHtml('<svg><path d="M1" /></svg><!-- <div> -->')).toEqual([
			{ kind: "run", text: '<svg><path d="M1" /></svg><!-- <div> -->' },
		]);
	});
});
