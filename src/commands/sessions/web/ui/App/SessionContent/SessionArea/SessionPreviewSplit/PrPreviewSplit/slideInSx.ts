export const SPLIT_MS = 280;
export const SPLIT_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

function placementSx(open: boolean, full: boolean, stacked: boolean) {
	const size = full ? "100%" : "50%";
	if (stacked)
		return {
			left: 0,
			right: 0,
			bottom: 0,
			height: size,
			transform: open ? "none" : "translateY(100%)",
		};
	return {
		top: 0,
		right: 0,
		bottom: 0,
		width: size,
		transform: open ? "none" : "translateX(100%)",
	};
}

export function slideInSx(open: boolean, full: boolean, stacked = false) {
	return {
		position: "absolute",
		...placementSx(open, full, stacked),
		display: "flex",
		opacity: open ? 1 : 0,
		"&:focus": { outline: "none" },
		transition: `transform ${SPLIT_MS}ms ${SPLIT_EASE}, opacity ${SPLIT_MS}ms ${SPLIT_EASE}, width ${SPLIT_MS}ms ${SPLIT_EASE}, height ${SPLIT_MS}ms ${SPLIT_EASE}`,
	} as const;
}
