import type { BacklogComment } from "./types";

function yoloCompletionLines(numbered: string[], rewindLine: string): string[] {
	return [
		"This session runs in yolo mode, and yolo mode is the completion instruction — read carefully:",
		"- Once every acceptance criterion passes and /commit has run, run the completion steps below straight away. Do not ask the user to confirm completion and do not wait for them.",
		"- If a criterion cannot be made to pass, do not run the completion steps: report what fails and wait for the user's explicit instruction, as you would outside yolo mode.",
		"",
		"Completion steps:",
		...numbered,
		"",
		"Precedence rules — read carefully:",
		"- Every criterion passing plus a successful commit means the work is complete. Always finish with done + phase-done; never rewind committed work as an automatic response.",
		rewindLine,
	];
}

export function buildReviewCompletionLines(
	itemId: string,
	phaseNumber: number,
	comments: BacklogComment[] = [],
	yolo = false,
): string[] {
	const steps = [
		"/commit",
		...(comments.some((comment) => comment.type === "why")
			? [
					`assist backlog delivered ${itemId} "<one plain-English line a non-developer understands: what now works for the user and its visible effect; no file, function, key or table names>"`,
				]
			: []),
		`assist backlog done ${itemId} "<summary>"`,
		`assist backlog phase-done ${itemId} ${phaseNumber} "done"`,
	];
	const rewindLine = `- Rewinding is a confirm-first exception, not the normal path. If you believe a criterion genuinely no longer fits and the work should return to an earlier phase, you must ask the user and get explicit confirmation first. Only after they confirm may you run \`assist backlog rewind ${itemId} <phase> --reason "<reason>"\`. Never rewind silently.`;
	const numbered = steps.map((step, i) => `${i + 1}. Run: ${step}`);
	if (yolo) return yoloCompletionLines(numbered, rewindLine);
	return [
		"What counts as a completion confirmation — read carefully:",
		"- Marking the item done/phase-done requires an explicit, unambiguous instruction to complete it (e.g. the user says the item is done/accepted or tells you to mark it complete). Nothing else counts.",
		"- Approving or running an unrelated action is NOT a completion signal. In particular, approving a `/pr`, raising a PR, or posting it to Slack via `/prs-slack` does not mean the item is complete — raising and announcing a PR is not confirmation that the story is done. Never run `done`/`phase-done` as a side effect of those actions.",
		"- If it is unclear whether the user's message is a completion confirmation, ask them explicitly before running done/phase-done.",
		"",
		"Once the user gives that explicit completion instruction:",
		...numbered,
		"",
		"Precedence rules — read carefully:",
		"- An explicit completion instruction plus a successful commit means the work is complete. Always finish with done + phase-done; never rewind already-approved, committed work as an automatic response.",
		"- If the implementation has diverged from the recorded acceptance criteria but the user has approved it, the default is still to complete the item. You may optionally offer to update the acceptance criteria, but stale criteria are not a reason to rewind.",
		rewindLine,
	];
}
