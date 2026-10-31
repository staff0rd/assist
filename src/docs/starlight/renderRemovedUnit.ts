import { diffHtml, docsDiffClasses, renderDiffBlock } from "./renderDiffBlock";
import type { MdastNode } from "./toDiffBlocks";
import type { DiffUnit } from "./toDiffUnits";
import { toInsertable } from "./toInsertable";
import { withTagClass } from "./withTagClass";

function renderPlain(unit: DiffUnit, declared: Set<string>): MdastNode[] {
	if (unit.kind === "node") return [toInsertable(unit.node, declared)];
	if (unit.kind === "html") return [diffHtml(unit.part.text)];
	return [unit.open, ...unit.children, unit.close].flatMap((child) =>
		renderPlain(child, declared),
	);
}

export function renderRemovedUnit(
	unit: DiffUnit,
	declared: Set<string>,
): MdastNode[] {
	const className = docsDiffClasses.removed;
	if (unit.kind === "node")
		return renderDiffBlock(toInsertable(unit.node, declared), className);
	if (unit.kind === "element")
		return [
			diffHtml(withTagClass(unit.open.part.text, className)),
			...unit.children.flatMap((child) => renderPlain(child, declared)),
			diffHtml(unit.close.part.text),
		];
	if (unit.part.kind !== "run") return [];
	return [diffHtml(`<div class="${className}">${unit.part.text}</div>`)];
}
