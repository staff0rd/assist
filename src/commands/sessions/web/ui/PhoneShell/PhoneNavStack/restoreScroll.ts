import { phoneScrollers } from "./phoneScrollers";

const MAX_FRAMES = 60;

export function restoreScroll(page: HTMLElement, tops: number[]): () => void {
	let frame = 0;
	let handle = 0;
	const step = () => {
		const scrollers = phoneScrollers(page);
		let done = true;
		tops.forEach((top, i) => {
			const el = scrollers[i];
			if (el) el.scrollTop = top;
			if (!el || Math.abs(el.scrollTop - top) > 1) done = false;
		});
		if (!done && ++frame < MAX_FRAMES) handle = requestAnimationFrame(step);
	};
	const stop = () => {
		cancelAnimationFrame(handle);
		page.removeEventListener("touchstart", stop);
	};
	page.addEventListener("touchstart", stop, { passive: true });
	step();
	return stop;
}
