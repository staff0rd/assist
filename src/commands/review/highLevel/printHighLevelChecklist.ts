import chalk from "chalk";
import { formatCriticalDiffs } from "./formatCriticalDiffs";
import { formatHighLevelChecklist } from "./formatHighLevelChecklist";
import { formatHighLevelStructure } from "./formatHighLevelStructure";
import { highLevelChangedFileCount } from "./highLevelChangedFileCount";
import type { HighLevelOverlaySubject } from "./openHighLevelOverlay";

export function printHighLevelChecklist(
	subject: HighLevelOverlaySubject,
): void {
	console.log(
		chalk.bold(`High-level review of ${subject.repo}#${subject.prNumber}`),
		chalk.dim(
			`· ${highLevelChangedFileCount(subject.structure)} changed files`,
		),
	);
	console.log(formatHighLevelChecklist(subject.checks));
	console.log("");
	console.log(formatHighLevelStructure(subject.structure));
	console.log("");
	console.log(
		formatCriticalDiffs(subject.criticalDiffs, subject.criticalPaths),
	);
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
