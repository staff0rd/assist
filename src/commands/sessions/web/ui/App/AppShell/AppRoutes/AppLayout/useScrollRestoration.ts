import {
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import type { ScrollRestoration } from "../../../../useScrollRestorationContext";

type ScrollRestorer = {
	containerRef: RefObject<HTMLDivElement | null>;
	restoration: ScrollRestoration;
};

export function useScrollRestoration(pathname: string): ScrollRestorer {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const offsets = useRef(new Map<string, number>());
	const pending = useRef<number | null>(null);
	const currentPath = useRef(pathname);

	const applyPending = useCallback(() => {
		const container = containerRef.current;
		if (container === null || pending.current === null) return;
		container.scrollTop = pending.current;
	}, []);

	useLayoutEffect(() => {
		currentPath.current = pathname;
		pending.current = offsets.current.get(pathname) ?? 0;
		applyPending();
	}, [pathname, applyPending]);

	useEffect(() => {
		const container = containerRef.current;
		if (container === null) return;
		const record = () =>
			offsets.current.set(currentPath.current, container.scrollTop);
		container.addEventListener("scroll", record, { passive: true });
		return () => container.removeEventListener("scroll", record);
	}, []);

	const restoration = useMemo<ScrollRestoration>(
		() => ({
			reportContentReady: () => {
				applyPending();
				pending.current = null;
			},
		}),
		[applyPending],
	);

	return { containerRef, restoration };
}
