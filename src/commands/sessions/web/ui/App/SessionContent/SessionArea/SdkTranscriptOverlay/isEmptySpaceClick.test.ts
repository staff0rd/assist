// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { isEmptySpaceClick } from "./isEmptySpaceClick";

const rect = { left: 0, right: 100, top: 0, bottom: 20 } as DOMRect;

function caretAt(node: Node) {
	const range = document.createRange();
	range.setStart(node, 0);
	Object.assign(document, { caretRangeFromPoint: vi.fn(() => range) });
}

function mockTextRects(rects: DOMRect[]) {
	Range.prototype.getClientRects = () => rects as unknown as DOMRectList;
}

afterEach(() => {
	Reflect.deleteProperty(document, "caretRangeFromPoint");
	Reflect.deleteProperty(Range.prototype, "getClientRects");
	document.body.innerHTML = "";
	globalThis.getSelection()?.removeAllRanges();
});

function mount(html: string) {
	document.body.innerHTML = html;
	return document.body.firstElementChild as HTMLElement;
}

describe("isEmptySpaceClick", () => {
	it("is empty space when the caret lands on no text", () => {
		const gap = mount("<div></div>");
		expect(isEmptySpaceClick({ target: gap, clientX: 5, clientY: 5 })).toBe(
			true,
		);
	});

	it("is not empty space when the point is inside a text node's rects", () => {
		const row = mount("<p>hello world</p>");
		caretAt(row.firstChild as Node);
		mockTextRects([rect]);
		expect(isEmptySpaceClick({ target: row, clientX: 10, clientY: 10 })).toBe(
			false,
		);
	});

	it("is empty space beside a text line's rects", () => {
		const row = mount("<p>hi</p>");
		caretAt(row.firstChild as Node);
		mockTextRects([rect]);
		expect(isEmptySpaceClick({ target: row, clientX: 300, clientY: 10 })).toBe(
			true,
		);
	});

	it("ignores whitespace-only text nodes", () => {
		const row = mount("<div>   </div>");
		caretAt(row.firstChild as Node);
		mockTextRects([rect]);
		expect(isEmptySpaceClick({ target: row, clientX: 10, clientY: 10 })).toBe(
			true,
		);
	});

	it.each([
		"<button><span>go</span></button>",
		'<a href="#"><span>x</span></a>',
		'<div role="button"><span>tool</span></div>',
		'<div tabindex="0"><span>row</span></div>',
		"<details><summary><span>s</span></summary></details>",
		"<div data-preview-skip><span>s</span></div>",
	])("is not empty space inside %s", (html) => {
		mount(html);
		const target = document.querySelector("span") as HTMLElement;
		expect(isEmptySpaceClick({ target, clientX: 5, clientY: 5 })).toBe(false);
	});

	it("is not empty space while text is selected", () => {
		const row = mount("<div><p>picked</p></div>");
		const range = document.createRange();
		range.selectNodeContents(row.querySelector("p") as Node);
		globalThis.getSelection()?.addRange(range);
		expect(isEmptySpaceClick({ target: row, clientX: 5, clientY: 5 })).toBe(
			false,
		);
	});
});
