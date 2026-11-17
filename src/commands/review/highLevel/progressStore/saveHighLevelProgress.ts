import { writeJsonFile } from "../writeJsonFile";
import { highLevelProgressPath } from "./highLevelProgressPath";
import { readStoredHighLevelProgress } from "./readStoredHighLevelProgress";
import type {
	HighLevelPaneProgress,
	HighLevelProgressHead,
} from "./StoredHighLevelProgress";
import { toStoredHighLevelProgress } from "./toStoredHighLevelProgress";

export function saveHighLevelProgress(
	head: HighLevelProgressHead,
	progress: HighLevelPaneProgress,
): boolean {
	const stored = readStoredHighLevelProgress(head.repo, head.prNumber);
	const closedRequests = stored?.closedRequests ?? [];
	if (head.requestId && closedRequests.includes(head.requestId)) return false;
	writeJsonFile(highLevelProgressPath(head.repo, head.prNumber), {
		...toStoredHighLevelProgress(head, progress),
		...(closedRequests.length > 0 ? { closedRequests } : {}),
	});
	return true;
}
