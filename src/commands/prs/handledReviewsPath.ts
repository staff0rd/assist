import { homedir } from "node:os";
import { join } from "node:path";

export function handledReviewsPath(
	org: string,
	repo: string,
	prNumber: number,
): string {
	return join(
		homedir(),
		".assist",
		"pr-comments",
		org,
		repo,
		`pr-${prNumber}-handled-reviews.json`,
	);
}
