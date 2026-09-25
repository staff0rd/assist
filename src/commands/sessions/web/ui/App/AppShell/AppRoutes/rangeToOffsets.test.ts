// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { applyHighlights } from "./SessionContent/SessionArea/SessionPreviewSplit/PrPreviewSplit/PrPreviewSlideIn/PrPreviewSlideInPane/PrPreviewPane/PrPreviewContent/PreviewBody/MarkdownSections/applyHighlights";
import { finishSelection } from "./finishSelection";
import { offsetsToRange, rangeToOffsets } from "./rangeToOffsets";

if (!Range.prototype.getBoundingClientRect) {
	Range.prototype.getBoundingClientRect = () =>
		({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }) as DOMRect;
}

function render(html: string): HTMLElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	document.body.append(root);
	return root;
}

const WITH_RULE =
	"<p>Repository: acme/widgets</p><hr><p>First body paragraph</p><p>Second body paragraph</p>";

describe("rangeToOffsets", () => {
	it("measures a boundary that sits on an element rather than in text", () => {
		const root = render(WITH_RULE);
		const range = document.createRange();
		range.setStart(root, 1);
		range.setEnd(root.querySelectorAll("p")[1]?.firstChild as Text, 5);

		expect(rangeToOffsets(root, range)).toEqual({ start: 24, end: 29 });
	});
});

describe("offsetsToRange", () => {
	it("refuses reversed offsets rather than throwing", () => {
		const root = render(WITH_RULE);

		expect(offsetsToRange(root, { start: 40, end: 10 })).toBeNull();
	});
});

describe("selecting from the rule above the body", () => {
	it("highlights the selected words instead of crashing", () => {
		const root = render(WITH_RULE);
		const first = root.querySelectorAll("p")[1]?.firstChild as Text;

		const pending = finishSelection(
			root,
			{ node: root, offset: 1 },
			{
				node: first,
				offset: 5,
			},
		);

		expect(pending).toMatchObject({ quote: "First", start: 24, end: 29 });
		applyHighlights(root, [{ start: 24, end: 29, color: "red" }]);
		expect(root.querySelector("mark.pr-comment")?.textContent).toBe("First");
	});
});
