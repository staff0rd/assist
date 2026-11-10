type Grid = { cols: number; rows: number; element: HTMLElement | undefined };

export function wheelCell(
	term: Grid,
	event: WheelEvent,
): { col: number; row: number; rowHeight: number } {
	const screen =
		term.element?.querySelector<HTMLElement>(".xterm-screen") ?? term.element;
	const rect = screen?.getBoundingClientRect();
	if (!rect || rect.width === 0 || rect.height === 0)
		return { col: 1, row: 1, rowHeight: 16 };
	const rowHeight = rect.height / term.rows;
	const clamp = (n: number, max: number) => Math.max(1, Math.min(max, n));
	return {
		col: clamp(
			Math.floor((event.clientX - rect.left) / (rect.width / term.cols)) + 1,
			term.cols,
		),
		row: clamp(
			Math.floor((event.clientY - rect.top) / rowHeight) + 1,
			term.rows,
		),
		rowHeight,
	};
}
