import { useLayoutEffect, useRef } from "react";
import { phoneScrollers } from "./phoneScrollers";
import { restoreScroll } from "./restoreScroll";

const MAX_PAGES = 50;
const saved = new Map<string, number[]>();

function remember(key: string, tops: number[]) {
	saved.delete(key);
	saved.set(key, tops);
	if (saved.size > MAX_PAGES) saved.delete(saved.keys().next().value ?? "");
}

export function useScrollMemory(key: string) {
	const ref = useRef<HTMLElement | null>(null);
	useLayoutEffect(() => {
		const page = ref.current;
		if (!page) return;
		const tops = saved.get(key);
		const stopRestore = tops && restoreScroll(page, tops);
		return () => {
			stopRestore?.();
			remember(
				key,
				phoneScrollers(page).map((el) => el.scrollTop),
			);
		};
	}, [key]);
	return ref;
}
