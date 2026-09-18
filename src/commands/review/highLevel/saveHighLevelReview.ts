import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { highLevelReviewPath } from "./highLevelReviewPath";
import type { HighLevelReviewRecord } from "./types";

export function saveHighLevelReview(record: HighLevelReviewRecord): string {
	const path = highLevelReviewPath(record.repo, record.headRef, record.headSha);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
	return path;
}
