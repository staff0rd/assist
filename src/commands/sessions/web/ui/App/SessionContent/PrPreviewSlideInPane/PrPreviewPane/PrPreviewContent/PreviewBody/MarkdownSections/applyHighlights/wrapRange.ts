import { textWalker } from "../../../../../../../textWalker";

type ColoredOffsets = {
	start: number;
	end: number;
	color: string;
	pin?: string;
};

export function wrapRange(
	root: Node,
	range: Range,
	{ color, pin }: ColoredOffsets,
): void {
	const walker = textWalker(root);
	const targets: { node: Text; start: number; end: number }[] = [];
	let node = walker.nextNode();
	while (node) {
		const text = node as Text;
		if (range.intersectsNode(text)) {
			const start = text === range.startContainer ? range.startOffset : 0;
			const end = text === range.endContainer ? range.endOffset : text.length;
			if (start < end) targets.push({ node: text, start, end });
		}
		node = walker.nextNode();
	}
	const marks = targets.map((t) =>
		wrapWithinNode(t.node, t.start, t.end, color),
	);
	const last = marks.at(-1);
	if (last && pin) last.dataset.pin = pin;
}

function wrapWithinNode(
	node: Text,
	start: number,
	end: number,
	color: string,
): HTMLElement {
	const range = document.createRange();
	range.setStart(node, start);
	range.setEnd(node, end);
	const mark = document.createElement("mark");
	mark.className = "pr-comment";
	mark.style.backgroundColor = color;
	range.surroundContents(mark);
	return mark;
}
