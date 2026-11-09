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
const HEAD_PREFIX = `${PREFIX}head:`;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const key = (requestId: string) => `${PREFIX}${requestId}`;
const headKey = (head: string) => `${HEAD_PREFIX}${head}`;

const load = (k: string) => loadPersisted<HighLevelPaneProgress>(k)[0];

function loadCarried(
	supersedes: string | undefined,
	head: string | undefined,
): HighLevelPaneProgress | undefined {
	const carried = supersedes ? load(key(supersedes)) : undefined;
	if (supersedes) clearPersisted(key(supersedes));
	return carried ?? (head ? load(headKey(head)) : undefined);
}

export function loadPersistedHighLevelProgress(
	requestId: string,
	supersedes: string | undefined,
	head: string | undefined,
): HighLevelPaneProgress | undefined {
	prunePersisted(PREFIX, TTL_MS);
	return load(key(requestId)) ?? loadCarried(supersedes, head);
}

export function savePersistedHighLevelProgress(
	requestId: string,
	head: string | undefined,
	progress: HighLevelPaneProgress,
): void {
	savePersisted(key(requestId), [progress]);
	if (head) savePersisted(headKey(head), [progress]);
}

export function clearPersistedHighLevelProgress(
	requestId: string,
	head: string | undefined,
): void {
	clearPersisted(key(requestId));
	if (head) clearPersisted(headKey(head));
}
