import { createContext, useContext, useEffect, useRef } from "react";

export type SwipeBackTarget = { current: (() => void) | null };

export const SwipeBackTargetContext = createContext<SwipeBackTarget>({
	current: null,
});

export function useEdgeSwipeBack(onBack: () => void, enabled = true): void {
	const target = useContext(SwipeBackTargetContext);
	const onBackRef = useRef(onBack);
	onBackRef.current = onBack;

	useEffect(() => {
		if (!enabled) return;
		const handler = () => onBackRef.current();
		target.current = handler;
		return () => {
			if (target.current === handler) target.current = null;
		};
	}, [target, enabled]);
}
