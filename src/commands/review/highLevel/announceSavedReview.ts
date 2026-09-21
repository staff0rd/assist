import chalk from "chalk";
import type { HighLevelOverlaySubject } from "./openHighLevelOverlay";

export function announceSavedReview(
	subject: HighLevelOverlaySubject,
	force: boolean,
): void {
	const head = subject.headSha.slice(0, 7);
	if (subject.saved)
		console.log(
			chalk.dim(
				`Reopening the review saved for ${head} at ${subject.saved.reviewedAt} (${subject.saved.verdict}); pass --force to start fresh.`,
			),
		);
	else if (force)
		console.log(
			chalk.dim(
				`Discarding any review saved for ${head} and starting fresh (--force).`,
			),
		);
}
