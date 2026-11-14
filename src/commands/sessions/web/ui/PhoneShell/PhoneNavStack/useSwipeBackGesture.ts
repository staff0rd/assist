import { useTheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";
import { isNativePlatform } from "../../isNativeApp";
import { createEdgeSwipeHandlers } from "../createEdgeSwipeHandlers";
import { type SwipeBackSources, swipeBackDriver } from "./swipeBackDriver";

export function useSwipeBackGesture(sources: Omit<SwipeBackSources, "motion">) {
	const { motion } = useTheme().tokens;
	const latest = useRef({ ...sources, motion });
	latest.current = { ...sources, motion };

	useEffect(() => {
		if (!isNativePlatform) return;
		const handlers = Object.entries(
			createEdgeSwipeHandlers(
				motion.swipe,
				swipeBackDriver(() => latest.current),
			),
		) as [keyof DocumentEventMap, (e: TouchEvent) => void][];
		for (const [type, handler] of handlers)
			document.addEventListener(type, handler as EventListener, {
				passive: type !== "touchmove",
			});
		return () => {
			for (const [type, handler] of handlers)
				document.removeEventListener(type, handler as EventListener);
		};
	}, [motion.swipe]);
}
