export function buildReviewCheckLines(
	manualChecks: string[],
	askCheck: boolean,
): string[] {
	if (manualChecks.length === 0) return [];
	const list = manualChecks.map((c, i) => `${i + 1}. ${c}`);
	if (askCheck) {
		return [
			"Manual checks moved to this Review phase:",
			...list,
			"",
			"Raise each of these with `assist ask-check --json - < <file>` as a background task, one check at a time, doing no other work until it returns (see the 'Asking for a manual check' advice for the payload). If it exits non-zero before opening, ask for that check in chat instead. Wait for every one to come back works; if one doesn't work, fix it and raise it again.",
			"",
		];
	}
	return [
		"Manual checks moved to this Review phase — ask the user to perform each one and wait for them to confirm it passes:",
		...list,
		"",
	];
}
