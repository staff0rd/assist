import { useRef } from "react";
import type { PrPreview } from "../../../../../../../shared/SessionInfoBase";
import { useLayoutFlip } from "./useLayoutFlip";
import { usePreviewWidth } from "./usePreviewWidth";
import { useStackedSplit } from "./useStackedSplit";

export function usePreviewLayout(rendered: PrPreview | null) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stacked = useStackedSplit(containerRef);
	const flipping = useLayoutFlip(stacked);
	const width = usePreviewWidth(rendered, stacked, flipping);
	return { containerRef, width };
}
