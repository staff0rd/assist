import { stripAnsi } from "../../../../shared/stripAnsi";
import { simulatedDivergenceNote } from "../../../watch/simulatedDivergenceNote";

const MAX_REASON_LINES = 20;
const MAX_REASON_CHARS = 2000;

const RECONCILE_STEPS = [
	"Reconcile it yourself, without discarding any commits on either side:",
	"",
	"1. Inspect `git status`, `git log --oneline @{u}..@` and `git log --oneline @..@{u}`.",
	'2. Stash any uncommitted work with `git stash push -u -m "assist divergence"`, and restore it with `git stash pop` once the branch is reconciled.',
	"3. Rebase the local commits onto the upstream with `git rebase @{u}`, resolving conflicts so both sides' changes survive. If the rebase cannot be resolved cleanly, `git rebase --abort` and `git merge @{u}` instead.",
	"4. Push the result with a plain `git push` so the branch matches its upstream again.",
	"5. Build the clone with `assist run auto-build`.",
	"6. Run /close. The daemon restarts the watcher once this session closes.",
	"",
	"Never force-push, `git reset`, or otherwise discard commits. If you cannot reconcile the branch without doing so, explain what is blocking it and leave this session open for the user instead of closing it.",
];

const SIMULATED_STEPS = [
	"This divergence was simulated to test the escalation; there is nothing to reconcile. Run /close now. The daemon restarts the watcher once this session closes.",
];

function divergenceReason(scrollback: string): string {
	return stripAnsi(scrollback)
		.split(/\r?\n|\r/)
		.map((line) => line.trimEnd())
		.filter((line) => line.trim().length > 0)
		.slice(-MAX_REASON_LINES)
		.join("\n")
		.slice(-MAX_REASON_CHARS);
}

export function divergencePrompt(clone: string, scrollback: string): string {
	const reason = divergenceReason(scrollback);
	return [
		`The watcher in ${clone} stopped because \`assist watch wait --pull --build\` could not fast-forward the branch (exit 3). The tail of its output:`,
		"",
		"```",
		reason || "(no output captured)",
		"```",
		"",
		...(reason.includes(simulatedDivergenceNote)
			? SIMULATED_STEPS
			: RECONCILE_STEPS),
	].join("\n");
}
