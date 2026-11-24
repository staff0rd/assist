const USER_SCROLL_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"];

export function restoreWhenRendered(
	main: HTMLElement,
	content: HTMLElement | null,
	top: number,
	onDone: () => void,
) {
	const observer =
		typeof ResizeObserver === "undefined"
			? undefined
			: new ResizeObserver(() => attempt());
	const stop = () => {
		observer?.disconnect();
		for (const type of USER_SCROLL_EVENTS) main.removeEventListener(type, stop);
		onDone();
	};
	// Lazily rendered panels grow the column after mount, so keep reapplying
	// the offset until it sticks or the user scrolls first.
	const attempt = () => {
		main.scrollTop = top;
		if (Math.abs(main.scrollTop - top) < 1) stop();
	};
	for (const type of USER_SCROLL_EVENTS)
		main.addEventListener(type, stop, { passive: true });
	if (content) observer?.observe(content);
	attempt();
	return stop;
}
