import type { DiffBlock } from "./diffBlocks";
import { type DiffUnit, toDiffUnits } from "./toDiffUnits";
import { keyOf } from "./keyOf";
import { sourceOf } from "./sourceOf";

type Point = { offset?: number };

export type MdastNode = {
	type: string;
	name?: string;
	value?: string;
	ordered?: boolean | null;
	attributes?: Record<string, string | null | undefined> | null;
	data?: Record<string, unknown>;
	position?: { start: Point; end: Point };
	children?: MdastNode[];
};

const IGNORED = new Set(["yaml", "toml", "definition"]);
const LIST_MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;

function containerOf(unit: DiffUnit): string | undefined {
	if (unit.kind === "element")
		return unit.children.some((child) => child.kind === "element")
			? `html:${unit.open.part.text}`
			: undefined;
	if (unit.kind !== "node") return undefined;
	if (unit.node.type === "list") return `list:${unit.node.ordered === true}`;
	if (unit.node.type === "table") return "table";
	return undefined;
}

function childBlocks(unit: DiffUnit, source: string): DiffBlock<DiffUnit>[] {
	if (unit.kind === "element")
		return unit.children.map((child) => toBlock(child, source));
	if (unit.kind !== "node") return [];
	return (unit.node.children ?? []).map((child) => ({
		key: sourceOf(child, source).replace(LIST_MARKER, ""),
		node: { kind: "node", node: child },
	}));
}

function toBlock(unit: DiffUnit, source: string): DiffBlock<DiffUnit> {
	const key = keyOf(unit, source);
	const container = containerOf(unit);
	if (!container) return { key, node: unit };
	return {
		key,
		node: unit,
		container,
		children: childBlocks(unit, source),
	};
}

export function toDiffBlocks(
	root: MdastNode,
	source: string,
): DiffBlock<DiffUnit>[] {
	const nodes = (root.children ?? []).filter((node) => !IGNORED.has(node.type));
	return toDiffUnits(nodes).map((unit) => toBlock(unit, source));
}
