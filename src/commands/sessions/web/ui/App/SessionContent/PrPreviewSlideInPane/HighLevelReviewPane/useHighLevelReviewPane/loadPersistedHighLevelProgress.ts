import type {
	PreviewChecklistItem,
	PreviewReviewComment,
} from "../../../../../../../shared/PreviewDecision";
import {
	clearPersisted,
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../../loadPersisted";

export type HighLevelPaneProgress = {
	items: PreviewChecklistItem[];
	reviewComments?: PreviewReviewComment[];
};

const PREFIX = "assist:high-level-progress:";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const key = (requestId: string) => `${PREFIX}${requestId}`;

export function loadPersistedHighLevelProgress(
	requestId: string,
	supersedes: string | undefined,
): HighLevelPaneProgress | undefined {
	prunePersisted(PREFIX, TTL_MS);
	const saved = loadPersisted<HighLevelPaneProgress>(key(requestId))[0];
	if (saved || !supersedes) return saved;
	const carried = loadPersisted<HighLevelPaneProgress>(key(supersedes))[0];
	clearPersisted(key(supersedes));
	return carried;
}

export function savePersistedHighLevelProgress(
	requestId: string,
	progress: HighLevelPaneProgress,
): void {
	savePersisted(key(requestId), [progress]);
}

export function clearPersistedHighLevelProgress(requestId: string): void {
	clearPersisted(key(requestId));
}
