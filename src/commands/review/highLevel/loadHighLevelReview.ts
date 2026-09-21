import { existsSync, readFileSync } from "node:fs";
import { highLevelReviewPath } from "./highLevelReviewPath";
import type { HighLevelReviewRecord } from "./types";

export function loadHighLevelReview(
	repo: string,
	headRef: string,
	headSha: string,
): HighLevelReviewRecord | undefined {
	const path = highLevelReviewPath(repo, headRef, headSha);
	if (!existsSync(path)) return undefined;
	try {
		return JSON.parse(readFileSync(path, "utf8")) as HighLevelReviewRecord;
	} catch {
		return undefined;
	}
}
