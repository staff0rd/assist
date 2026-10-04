import { REGION_ATTRIBUTE } from "../sessionRegion";

export function isDiffFocused(id: string): boolean {
	const focused = globalThis.document.activeElement;
	return focused?.closest(`[${REGION_ATTRIBUTE.diff}="${id}"]`) != null;
}
