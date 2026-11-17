import chalk from "chalk";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";

function savedMessage(subject: HighLevelOverlaySubject): string | undefined {
	const head = subject.headSha.slice(0, 7);
	if (subject.progress)
		return `Reopening the review left open for #${subject.prNumber} at ${subject.progress.updatedAt}; Start fresh in the pane discards it.`;
	if (subject.saved)
		return `Reopening the review saved for ${head} at ${subject.saved.reviewedAt} (${subject.saved.verdict}); pass --force to start fresh.`;
	return undefined;
}

export function announceSavedReview(
	subject: HighLevelOverlaySubject,
	force: boolean,
): void {
	const message = savedMessage(subject);
	if (message) console.log(chalk.dim(message));
	else if (force)
		console.log(
			chalk.dim(
				`Discarding any verdict saved for ${subject.headSha.slice(0, 7)} and starting fresh (--force).`,
			),
		);
}
