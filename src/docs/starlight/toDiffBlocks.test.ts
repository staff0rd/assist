import { describe, expect, it } from "vitest";
import { type MdastNode, toDiffBlocks } from "./toDiffBlocks";

function at(
	source: string,
	text: string,
	node: Omit<MdastNode, "position">,
): MdastNode {
	const start = source.indexOf(text);
	return {
		...node,
		position: {
			start: { offset: start },
			end: { offset: start + text.length },
		},
	};
}

describe("toDiffBlocks", () => {
	it("keys blocks by their source, ignoring frontmatter and trailing spaces", () => {
		const source = "---\nt: x\n---\n\nPara  \nmore\n";
		const root = {
			type: "root",
			children: [
				at(source, "---\nt: x\n---", { type: "yaml" }),
				at(source, "Para  \nmore", { type: "paragraph" }),
			],
		};
		expect(toDiffBlocks(root, source).map((block) => block.key)).toEqual([
			"Para\nmore",
		]);
	});

	it("splits lists into items keyed without their markers", () => {
		const source = "1. one\n2. two\n";
		const list = at(source, source.trim(), {
			type: "list",
			ordered: true,
			children: [
				at(source, "1. one", { type: "listItem" }),
				at(source, "2. two", { type: "listItem" }),
			],
		});
		const [block] = toDiffBlocks({ type: "root", children: [list] }, source);
		expect(block.container).toBe("list:true");
		expect(block.children?.map((child) => child.key)).toEqual(["one", "two"]);
	});

	it("splits tables into rows", () => {
		const source = "| a |\n| - |\n| 1 |\n";
		const table = at(source, source.trim(), {
			type: "table",
			children: [
				at(source, "| a |", { type: "tableRow" }),
				at(source, "| 1 |", { type: "tableRow" }),
			],
		});
		const [block] = toDiffBlocks({ type: "root", children: [table] }, source);
		expect(block.container).toBe("table");
		expect(block.children?.map((child) => child.key)).toEqual([
			"| a |",
			"| 1 |",
		]);
	});
});
