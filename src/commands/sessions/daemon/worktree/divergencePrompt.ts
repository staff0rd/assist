import { stripAnsi } from "../../../../shared/stripAnsi";

const MAX_REASON_LINES = 20;
const MAX_REASON_CHARS = 2000;

export function divergencePrompt(clone: string, scrollback: string): string {
	const reason = stripAnsi(scrollback)
		.split(/\r?\n|\r/)
		.map((line) => line.trimEnd())
		.filter((line) => line.trim().length > 0)
		.slice(-MAX_REASON_LINES)
		.join("\n")
		.slice(-MAX_REASON_CHARS);
	return [
		`The watcher in ${clone} stopped because \`assist watch wait --pull --build\` could not fast-forward the branch (exit 3). The tail of its output:`,
		"",
		"```",
		reason || "(no output captured)",
		"```",
		"",
		"Diagnose why the local branch has diverged from its upstream and report what you find and the options for reconciling it. Do not force-push, `git reset`, or otherwise discard commits on either side — leave the decision to the user.",
	].join("\n");
}
