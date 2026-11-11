import type { RefObject } from "react";
import { useElementWidth } from "../../../../useElementWidth";

const STACKED_BELOW_PX = 1000;

export function useStackedSplit(ref: RefObject<HTMLElement | null>): boolean {
	const width = useElementWidth(ref);
	return width !== null && width < STACKED_BELOW_PX;
}
