import { describe, expect, it } from "vitest";
import type { MdastNode } from "./toDiffBlocks";
import { type DiffUnit, toDiffUnits } from "./toDiffUnits";

const html = (value: string): MdastNode => ({ type: "html", value });

function shape(unit: DiffUnit): unknown {
	if (unit.kind === "node") return unit.node.type;
	if (unit.kind === "html") return unit.part.text.trim();
	return { [unit.open.part.text]: unit.children.map(shape) };
}

describe("toDiffUnits", () => {
	it("rebuilds elements that span blank lines", () => {
		const units = toDiffUnits([
			html('<div class="cards">\n<article>\n<h3>A</h3>'),
			{ type: "paragraph" },
			html("</article>\n</div>"),
		]);
		expect(units.map(shape)).toEqual([
			{ '<div class="cards">': [{ "<article>": ["<h3>A</h3>", "paragraph"] }] },
		]);
	});

	it("leaves unclosed tags as plain units", () => {
		const units = toDiffUnits([html("<div>"), { type: "paragraph" }]);
		expect(units.map(shape)).toEqual(["<div>", "paragraph"]);
	});
});
