import type { SpinnerHandle } from "./MultiSpinner";
import { reviewerLabel } from "./reviewerLabel";

const SUMMARY_MAX_LEN = 80;

function summariseStderr(stderr: string): string {
	const firstLine = stderr.split(/\r?\n/).find((l) => l.trim().length > 0);
	if (!firstLine) return "";
	const trimmed = firstLine.trim();
	return trimmed.length > SUMMARY_MAX_LEN
		? `${trimmed.slice(0, SUMMARY_MAX_LEN - 1)}…`
		: trimmed;
}

type ReviewerOutcome = {
	name: string;
	model?: string;
	exitCode: number;
	elapsedMs: number;
	stderr?: string;
};

export function finaliseReviewerSpinner(
	spinner: SpinnerHandle,
	outcome: ReviewerOutcome,
): void {
	const label = reviewerLabel(outcome.name, outcome.model);
	const elapsed = Math.round(outcome.elapsedMs / 1000);
	if (outcome.exitCode === 0) {
		spinner.succeed(`${label} — done in ${elapsed}s`);
		return;
	}
	const summary = summariseStderr(outcome.stderr ?? "");
	const suffix = summary ? `: ${summary}` : "";
	spinner.fail(
		`${label} — failed in ${elapsed}s (exit ${outcome.exitCode})${suffix}`,
	);
}
