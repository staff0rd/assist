export const SPLIT_MS = 280;
export const SPLIT_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export function slideInSx(open: boolean) {
	return {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		width: "50%",
		display: "flex",
		transform: open ? "none" : "translateX(100%)",
		opacity: open ? 1 : 0,
		transition: `transform ${SPLIT_MS}ms ${SPLIT_EASE}, opacity ${SPLIT_MS}ms ${SPLIT_EASE}`,
	} as const;
}
