import { useEffect, useRef } from "react";
import { isNativePlatform } from "../isNativeApp";
import { createEdgeSwipeHandlers } from "./createEdgeSwipeHandlers";

export function useEdgeSwipeBack(onBack: () => void): void {
	const onBackRef = useRef(onBack);
	onBackRef.current = onBack;

	useEffect(() => {
		if (!isNativePlatform) return;
		const handlers = Object.entries(
			createEdgeSwipeHandlers(() => onBackRef.current()),
		) as [keyof DocumentEventMap, (e: TouchEvent) => void][];
		for (const [type, handler] of handlers)
			document.addEventListener(type, handler as EventListener, {
				passive: true,
			});
		return () => {
			for (const [type, handler] of handlers)
				document.removeEventListener(type, handler as EventListener);
		};
	}, []);
}
