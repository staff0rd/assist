import { REGION_ATTRIBUTE, type RegionKind } from "../sessionRegion";

export function isRegionFocused(kind: RegionKind, id: string): boolean {
	const focused = globalThis.document.activeElement;
	return focused?.closest(`[${REGION_ATTRIBUTE[kind]}="${id}"]`) != null;
}
