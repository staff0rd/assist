import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { handledReviewsPath } from "./handledReviewsPath";
import { loadLocalHandledReviewIds } from "./loadLocalHandledReviewIds";

export function markReviewHandledLocally(
	org: string,
	repo: string,
	prNumber: number,
	reviewId: number,
): void {
	const ids = loadLocalHandledReviewIds(org, repo, prNumber);
	ids.add(reviewId);
	const path = handledReviewsPath(org, repo, prNumber);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify([...ids].sort((a, b) => a - b))}\n`);
}
