import type { SpinnerHandle } from "./MultiSpinner";

const SUMMARY_MAX_LEN = 80;

function summariseStderr(stderr: string): string {
	const firstLine = stderr.split(/\r?\n/).find((l) => l.trim().length > 0);
	if (!firstLine) return "";
	const trimmed = firstLine.trim();
	return trimmed.length > SUMMARY_MAX_LEN
		? `${trimmed.slice(0, SUMMARY_MAX_LEN - 1)}…`
		: trimmed;
}

export function finaliseReviewerSpinner(
	spinner: SpinnerHandle,
	name: string,
	exitCode: number,
	elapsedMs: number,
	stderr = "",
): void {
	const elapsed = Math.round(elapsedMs / 1000);
	if (exitCode === 0) {
		spinner.succeed(`${name} — done in ${elapsed}s`);
		return;
	}
	const summary = summariseStderr(stderr);
	const suffix = summary ? `: ${summary}` : "";
	spinner.fail(`${name} — failed in ${elapsed}s (exit ${exitCode})${suffix}`);
}
