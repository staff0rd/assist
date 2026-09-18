import chalk from "chalk";
import { formatHighLevelChecklist } from "./formatHighLevelChecklist";
import type { HighLevelOverlaySubject } from "./openHighLevelOverlay";

export function printHighLevelChecklist(
	subject: HighLevelOverlaySubject,
): void {
	console.log(
		chalk.bold(`High-level review of ${subject.repo}#${subject.prNumber}`),
		chalk.dim(`· ${subject.changedFileCount} changed files`),
	);
	console.log(formatHighLevelChecklist(subject.checks));
	console.log(
		chalk.dim(
			"\nManual items are for the reviewer to judge; see docs/high-level-review.md.",
		),
	);
	console.log(
		chalk.dim(
			"Run this inside an assist session to step through the checklist in the web overlay.",
		),
	);
}
