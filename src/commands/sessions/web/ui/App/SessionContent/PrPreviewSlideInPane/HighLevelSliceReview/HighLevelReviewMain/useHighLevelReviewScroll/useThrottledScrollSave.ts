import { type RefObject, useEffect } from "react";

const SAVE_THROTTLE_MS = 200;

export function useThrottledScrollSave(
	mainRef: RefObject<HTMLElement | null>,
	pendingTop: RefObject<number | undefined>,
	restoring: RefObject<boolean>,
	save: RefObject<(scrollTop: number) => void>,
) {
	useEffect(() => {
		const main = mainRef.current;
		if (!main) return;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const flush = () => {
			clearTimeout(timer);
			timer = undefined;
			if (pendingTop.current !== undefined) save.current(pendingTop.current);
			pendingTop.current = undefined;
		};
		const record = () => {
			if (restoring.current) return;
			pendingTop.current = main.scrollTop;
			timer ??= setTimeout(flush, SAVE_THROTTLE_MS);
		};
		main.addEventListener("scroll", record, { passive: true });
		return () => {
			main.removeEventListener("scroll", record);
			flush();
		};
	}, [mainRef, pendingTop, restoring, save]);
}
