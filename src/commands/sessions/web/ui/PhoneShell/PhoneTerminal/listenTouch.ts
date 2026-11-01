type TouchHandler = (e: TouchEvent) => void;

type TouchHandlers = {
	start: TouchHandler;
	move: TouchHandler;
	end: TouchHandler;
};

export function listenTouch(
	el: HTMLElement,
	{ start, move, end }: TouchHandlers,
): () => void {
	el.addEventListener("touchstart", start, { passive: true });
	el.addEventListener("touchmove", move, { passive: false });
	el.addEventListener("touchend", end, { passive: true });
	el.addEventListener("touchcancel", end, { passive: true });
	return () => {
		el.removeEventListener("touchstart", start);
		el.removeEventListener("touchmove", move);
		el.removeEventListener("touchend", end);
		el.removeEventListener("touchcancel", end);
	};
}
