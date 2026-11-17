import { readJsonFile } from "../readJsonFile";
import { highLevelProgressPath } from "./highLevelProgressPath";
import type { StoredHighLevelProgress } from "./StoredHighLevelProgress";

export function readStoredHighLevelProgress(
	repo: string,
	prNumber: number,
): StoredHighLevelProgress | undefined {
	return readJsonFile<StoredHighLevelProgress>(
		highLevelProgressPath(repo, prNumber),
	);
}
