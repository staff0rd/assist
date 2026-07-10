import { buildCommentLines } from "./buildCommentLines";
import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

export function buildReviewPrompt(
	item: BacklogItem,
	phaseNumber: number,
): string {
	const acLines = item.acceptanceCriteria
		.map((ac, i) => `${i + 1}. ${ac}`)
		.join("\n");
	const itemId = formatItemId(item.id);

	return [
		`You are reviewing backlog item ${itemId}: ${item.name}`,
		"",
		item.description ? `Description: ${item.description}` : "",
		"",
		"This is the auto-generated review phase. Verify each acceptance criterion against the current implementation.",
		"If you need to modify backlog items, run `assist backlog --help` to discover available commands.",
		"For each criterion, inspect the code and report PASS or FAIL with a brief explanation:",
		"",
		acLines,
		...buildCommentLines(item.comments),
		"",
		"If any criterion fails, fix the issue and re-verify.",
		"",
		`Any sub-tasks on this item must all be done before it can be completed: \`assist backlog done\` and completing this Review phase both fail while any sub-task is not done. Check them with \`assist backlog show ${itemId}\` and mark each finished one done via \`assist backlog subtask-status ${itemId} <idx> done\`.`,
		"",
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${itemId} "<text>"\`.`,
		"",
		"After all criteria pass, ask the user to confirm any manual checks",
		"(e.g. end-to-end behaviour they need to verify themselves).",
		"Wait for the user to confirm before proceeding.",
		"",
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
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
