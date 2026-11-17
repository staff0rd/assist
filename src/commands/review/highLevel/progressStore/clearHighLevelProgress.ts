import { writeJsonFile } from "../writeJsonFile";
import { highLevelProgressPath } from "./highLevelProgressPath";
import { readStoredHighLevelProgress } from "./readStoredHighLevelProgress";

const CLEAR_REASONS = new Set(["verdict", "restart"]);
const KEPT_CLOSED_REQUESTS = 20;

type HighLevelProgressClearReason = "verdict" | "restart";

export function clearHighLevelProgress(
	repo: string,
	prNumber: number,
	reason: HighLevelProgressClearReason,
	requestId?: string,
): void {
	if (!CLEAR_REASONS.has(reason))
		throw new Error(
			`High-level review progress is cleared only by a verdict or a restart, not \`${reason}\`.`,
		);
	const previous =
		readStoredHighLevelProgress(repo, prNumber)?.closedRequests ?? [];
	writeJsonFile(highLevelProgressPath(repo, prNumber), {
		repo,
		prNumber,
		updatedAt: new Date().toISOString(),
		closedRequests: [...previous, ...(requestId ? [requestId] : [])].slice(
			-KEPT_CLOSED_REQUESTS,
		),
		items: [],
		reviewComments: [],
	});
}
