import type { MiroItem } from "../../../../../../../../../../../../../../miro/types";

export function miroBoardViewBox(boxes: MiroItem[]): string {
	if (boxes.length === 0) return "0 0 100 100";
	const left = Math.min(...boxes.map((box) => box.left));
	const top = Math.min(...boxes.map((box) => box.top));
	const width = Math.max(...boxes.map((box) => box.right)) - left;
	const height = Math.max(...boxes.map((box) => box.bottom)) - top;
	const pad = Math.max(width * 0.02, 8);
	return `${left - pad} ${top - pad} ${width + pad * 2} ${height + pad * 2}`;
}
