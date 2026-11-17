import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { highLevelReviewPath } from "../highLevelReviewPath";
import { readJsonFile } from "../readJsonFile";
import type { HighLevelReviewDraft } from "../types";
import { writeJsonFile } from "../writeJsonFile";
import { highLevelProgressPath } from "./highLevelProgressPath";
import { toStoredHighLevelProgress } from "./toStoredHighLevelProgress";

const DRAFT_SUFFIX = ".draft.json";

function draftsFor(dir: string, prNumber: number) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => name.endsWith(DRAFT_SUFFIX))
		.map((name) => ({
			path: join(dir, name),
			draft: readJsonFile<HighLevelReviewDraft>(join(dir, name)),
		}))
		.filter(({ draft }) => draft?.prNumber === prNumber);
}

export function migrateHighLevelDrafts(repo: string, prNumber: number): void {
	const dir = dirname(highLevelReviewPath(repo, "x", "x"));
	const drafts = draftsFor(dir, prNumber);
	const newest = drafts
		.map(({ draft }) => draft as HighLevelReviewDraft)
		.sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
	if (!newest) return;
	if (!existsSync(highLevelProgressPath(repo, prNumber)))
		writeJsonFile(
			highLevelProgressPath(repo, prNumber),
			toStoredHighLevelProgress(newest, newest),
		);
	for (const { path } of drafts) rmSync(path, { force: true });
}
