import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { highLevelReviewPath } from "../highLevelReviewPath";
import { readJsonFile } from "../readJsonFile";
import type { HighLevelReviewDraft } from "../types";
import { writeJsonFile } from "../writeJsonFile";
import { highLevelProgressPath } from "./highLevelProgressPath";
import { mergeHighLevelDrafts } from "./mergeHighLevelDrafts";
import { readStoredHighLevelProgress } from "./readStoredHighLevelProgress";

const DRAFT_SUFFIX = ".draft.json";

function draftsFor(dir: string, prNumber: number) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => name.endsWith(DRAFT_SUFFIX))
		.map((name) => ({
			path: join(dir, name),
			draft: readJsonFile<HighLevelReviewDraft>(join(dir, name)),
		}))
		.filter(
			(entry): entry is { path: string; draft: HighLevelReviewDraft } =>
				entry.draft?.prNumber === prNumber,
		);
}

export function migrateHighLevelDrafts(repo: string, prNumber: number): void {
	const dir = dirname(highLevelReviewPath(repo, "x", "x"));
	const drafts = draftsFor(dir, prNumber);
	if (drafts.length === 0) return;
	writeJsonFile(
		highLevelProgressPath(repo, prNumber),
		mergeHighLevelDrafts(
			readStoredHighLevelProgress(repo, prNumber),
			drafts.map(({ draft }) => draft),
		),
	);
	for (const { path } of drafts) rmSync(path, { force: true });
}
