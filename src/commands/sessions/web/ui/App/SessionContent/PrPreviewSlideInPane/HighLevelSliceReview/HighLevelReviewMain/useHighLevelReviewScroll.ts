import { type RefObject, useLayoutEffect, useRef } from "react";
import type { HighLevelArea } from "../highLevelAreaCheck";
import { restoreWhenRendered } from "./useHighLevelReviewScroll/restoreWhenRendered";
import { useThrottledScrollSave } from "./useHighLevelReviewScroll/useThrottledScrollSave";

type ScrollNav = {
	index: number;
	area: HighLevelArea | undefined;
	saveScroll: (scrollTop: number) => void;
	restoreScroll: () => number | undefined;
};

export function useHighLevelReviewScroll(
	mainRef: RefObject<HTMLElement | null>,
	contentRef: RefObject<HTMLElement | null>,
	nav: ScrollNav,
) {
	const navRef = useRef(nav);
	navRef.current = nav;
	const saveRef = useRef((scrollTop: number) =>
		navRef.current.saveScroll(scrollTop),
	);
	const mounted = useRef(false);
	const restoring = useRef(false);
	const pendingTop = useRef<number | undefined>(undefined);

	useLayoutEffect(() => {
		const main = mainRef.current;
		if (!main) return;
		pendingTop.current = undefined;
		const top = mounted.current ? undefined : navRef.current.restoreScroll();
		mounted.current = true;
		if (!top) {
			main.scrollTop = 0;
			return;
		}
		restoring.current = true;
		return restoreWhenRendered(main, contentRef.current, top, () => {
			restoring.current = false;
		});
	}, [mainRef, contentRef, nav.index, nav.area]);

	useThrottledScrollSave(mainRef, pendingTop, restoring, saveRef);
}
