import { lastIndexWhere } from "./lastIndexWhere";
import { type HtmlPart, splitHtml } from "./splitHtml";
import type { MdastNode } from "./toDiffBlocks";

export type HtmlUnit = {
	kind: "html";
	owner: MdastNode;
	part: HtmlPart;
	group: HtmlUnit[];
};

type ElementUnit = {
	kind: "element";
	open: HtmlUnit;
	children: DiffUnit[];
	close: HtmlUnit;
};

export type DiffUnit =
	| { kind: "node"; node: MdastNode }
	| HtmlUnit
	| ElementUnit;

type Frame = { open?: HtmlUnit; children: DiffUnit[] };

function explode(node: MdastNode): DiffUnit[] {
	if (node.type !== "html") return [{ kind: "node", node }];
	const group: HtmlUnit[] = [];
	for (const part of splitHtml(node.value ?? ""))
		group.push({ kind: "html", owner: node, part, group });
	return group.filter((unit) => unit.part.kind !== "space");
}

function closeUnit(stack: Frame[], close: HtmlUnit): boolean {
	const index = lastIndexWhere(
		stack,
		(frame) => frame.open?.part.tag === close.part.tag,
	);
	if (index <= 0) return false;
	while (stack.length - 1 > index) flatten(stack);
	const frame = stack.pop() as Frame & { open: HtmlUnit };
	stack.at(-1)?.children.push({
		kind: "element",
		open: frame.open,
		children: frame.children,
		close,
	});
	return true;
}

function flatten(stack: Frame[]): void {
	const frame = stack.pop() as Frame;
	stack
		.at(-1)
		?.children.push(...(frame.open ? [frame.open] : []), ...frame.children);
}

function place(stack: Frame[], unit: DiffUnit): void {
	if (unit.kind === "html" && unit.part.kind === "open")
		stack.push({ open: unit, children: [] });
	else if (
		unit.kind !== "html" ||
		unit.part.kind !== "close" ||
		!closeUnit(stack, unit)
	)
		stack.at(-1)?.children.push(unit);
}

export function toDiffUnits(nodes: MdastNode[]): DiffUnit[] {
	const root: Frame = { children: [] };
	const stack = [root];
	for (const unit of nodes.flatMap(explode)) place(stack, unit);
	while (stack.length > 1) flatten(stack);
	return root.children;
}
