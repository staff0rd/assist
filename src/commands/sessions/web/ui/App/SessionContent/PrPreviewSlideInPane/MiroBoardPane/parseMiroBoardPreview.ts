import type {
	MiroBoardPreview,
	MiroItem,
} from "../../../../../../../miro/types";

function isDrawable(box: MiroItem): boolean {
	return (
		typeof box?.id === "string" &&
		typeof box.text === "string" &&
		[box.left, box.top, box.right, box.bottom].every(
			(edge) => typeof edge === "number" && Number.isFinite(edge),
		)
	);
}

export function parseMiroBoardPreview(body: string): MiroItem[] {
	try {
		const parsed = JSON.parse(body) as MiroBoardPreview;
		return Array.isArray(parsed?.boxes) ? parsed.boxes.filter(isDrawable) : [];
	} catch {
		return [];
	}
}
