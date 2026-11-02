export function buildManualCheckLines(
	manualChecks: string[],
	commitBeforePhaseEnd: boolean,
	askCheck = false,
): string[] {
	if (manualChecks.length > 0 && askCheck) {
		return [
			"",
			"Once verify passes, run /commit to commit the work before asking the user to perform the manual checks below.",
			"Then raise each manual check with `assist ask-check --check <n> --json - < <file>` as a background task, where <n> is the check's number in the list below, one check at a time, doing no other work until it returns (see the 'Asking for a manual check' advice for the payload). If it exits non-zero before opening, ask for that check in chat instead.",
			"Keep your chat summary to a few lines; the check itself carries the steps.",
			"Manual checks:",
			...manualChecks.map((c, i) => `${i + 1}. ${c}`),
			"",
			"Wait for every manual check to come back works before proceeding; if one doesn't work, fix it and raise it again.",
			'If a check comes back "moved to phase <m>", the user moved it to that later phase: treat it as resolved for this phase and do not raise it again. Moving a check renumbers the checks after it down by one, so pass their new <n>.',
		];
	}
	if (manualChecks.length > 0) {
		return [
			"",
			...(commitBeforePhaseEnd
				? [
						"Once verify passes, run /commit to commit the work before asking the user to perform the manual checks below.",
					]
				: []),
			"Before marking this phase as done, ask the user to perform these manual checks:",
			...manualChecks.map((c) => `- ${c}`),
			"",
			"Wait for the user to confirm all manual checks pass before proceeding.",
		];
	}
	if (commitBeforePhaseEnd) {
		return [
			"",
			"Once verify passes, run /commit to commit the work before marking this phase as done.",
		];
	}
	return [];
}
