export function buildReviewCompletionLines(
	itemId: string,
	phaseNumber: number,
): string[] {
	return [
		"What counts as a completion confirmation — read carefully:",
		"- Marking the item done/phase-done requires an explicit, unambiguous instruction to complete it (e.g. the user says the item is done/accepted or tells you to mark it complete). Nothing else counts.",
		"- Approving or running an unrelated action is NOT a completion signal. In particular, approving a `/pr`, raising a PR, or posting it to Slack via `/prs-slack` does not mean the item is complete — raising and announcing a PR is not confirmation that the story is done. Never run `done`/`phase-done` as a side effect of those actions.",
		"- If it is unclear whether the user's message is a completion confirmation, ask them explicitly before running done/phase-done.",
		"",
		"Once the user gives that explicit completion instruction:",
		"1. Run: /commit",
		`2. Run: assist backlog done ${itemId} "<summary>"`,
		`3. Run: assist backlog phase-done ${itemId} ${phaseNumber} "done"`,
		"",
		"Precedence rules — read carefully:",
		"- An explicit completion instruction plus a successful commit means the work is complete. Always finish with done + phase-done; never rewind already-approved, committed work as an automatic response.",
		"- If the implementation has diverged from the recorded acceptance criteria but the user has approved it, the default is still to complete the item. You may optionally offer to update the acceptance criteria, but stale criteria are not a reason to rewind.",
		`- Rewinding is a confirm-first exception, not the normal path. If you believe a criterion genuinely no longer fits and the work should return to an earlier phase, you must ask the user and get explicit confirmation first. Only after they confirm may you run \`assist backlog rewind ${itemId} <phase> --reason "<reason>"\`. Never rewind silently.`,
	];
}
