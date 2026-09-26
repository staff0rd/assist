import { type CSSProperties, useRef } from "react";
import {
	DEFAULT_PINNED_HEADER_HEIGHT,
	PINNED_HEADER_HEIGHT_VAR,
} from "./itemSectionAnchor";
import { useElementHeight } from "./useElementHeight";

export function usePinnedHeaderHeight() {
	const headerRef = useRef<HTMLDivElement>(null);
	const headerHeight = useElementHeight(
		headerRef,
		DEFAULT_PINNED_HEADER_HEIGHT,
	);
	const style = {
		[PINNED_HEADER_HEIGHT_VAR]: `${headerHeight}px`,
	} as CSSProperties;
	return { headerRef, headerHeight, style };
}
