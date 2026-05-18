import type { SpinnerHandle } from "./MultiSpinner";

export function finaliseReviewerSpinner(
	spinner: SpinnerHandle,
	name: string,
	exitCode: number,
	elapsedMs: number,
): void {
	const elapsed = Math.round(elapsedMs / 1000);
	if (exitCode === 0) {
		spinner.succeed(`${name} — done in ${elapsed}s`);
		return;
	}
	spinner.fail(`${name} — failed in ${elapsed}s`);
}
