export function buildReviewConfirmLines(yolo: boolean): string[] {
	if (yolo) {
		return [
			"After all criteria pass, raise any manual checks with `assist ask-check`; yolo mode answers them, so do not ask for confirmation in chat.",
		];
	}
	return [
		"After all criteria pass, ask the user to confirm any manual checks",
		"(e.g. end-to-end behaviour they need to verify themselves).",
		"Wait for the user to confirm before proceeding.",
	];
}
