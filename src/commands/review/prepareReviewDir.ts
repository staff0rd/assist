import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import type { ReviewPaths } from "./buildReviewPaths";

function clearReviewFiles(paths: ReviewPaths): void {
	for (const path of [paths.claudePath, paths.codexPath, paths.synthesisPath]) {
		if (existsSync(path)) unlinkSync(path);
	}
}

export function prepareReviewDir(
	paths: ReviewPaths,
	requestBody: string,
	force: boolean,
): void {
	mkdirSync(paths.reviewDir, { recursive: true });
	if (force) clearReviewFiles(paths);
	writeFileSync(paths.requestPath, requestBody);
}
