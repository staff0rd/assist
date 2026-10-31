import type { DiffVisitorContext, NodeEdit } from "./applyEdit";
import { diffHtml, docsDiffClasses } from "./renderDiffBlock";
import type { MdastNode } from "./toDiffBlocks";
import type { HtmlUnit } from "./toDiffUnits";
import { withTagClass } from "./withTagClass";

function renderAdded({ part }: HtmlUnit): string {
	const className = docsDiffClasses.added;
	if (part.kind === "open") return withTagClass(part.text, className);
	if (part.kind === "run")
		return `<div class="${className}">${part.text}</div>`;
	return part.text;
}

export function applyHtmlEdits(
	edits: Map<HtmlUnit, NodeEdit>,
	ctx: DiffVisitorContext,
): void {
	const groups = new Set([...edits.keys()].map((unit) => unit.group));
	for (const group of groups)
		ctx.replaceNode(
			group[0].owner,
			group.flatMap((unit): MdastNode[] => {
				const edit = edits.get(unit);
				const self = diffHtml(edit?.added ? renderAdded(unit) : unit.part.text);
				return edit ? [...edit.before, self, ...edit.after] : [self];
			}),
		);
}
