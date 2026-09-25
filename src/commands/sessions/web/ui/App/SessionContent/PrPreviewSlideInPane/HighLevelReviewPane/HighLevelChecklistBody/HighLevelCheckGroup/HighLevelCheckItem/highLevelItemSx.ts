const FAILED_TINT = "rgba(244, 67, 54, 0.1)";

export function highLevelItemSx(failed: boolean) {
	return {
		px: 2,
		py: 1.25,
		borderLeft: 3,
		borderColor: failed ? "error.main" : "transparent",
		bgcolor: failed ? FAILED_TINT : undefined,
	} as const;
}
