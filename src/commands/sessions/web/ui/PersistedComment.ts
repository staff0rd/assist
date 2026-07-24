import {
	clearPersisted,
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "./loadPersisted";

export type PersistedComment = {
	quote: string;
	note: string;
	start: number;
	end: number;
};

const PREFIX = "assist:pr-preview-comments:";

const key = (requestId: string) => `${PREFIX}${requestId}`;

export function loadPersistedComments(requestId: string): PersistedComment[] {
	return loadPersisted<PersistedComment>(key(requestId));
}

export function savePersistedComments(
	requestId: string,
	items: PersistedComment[],
): void {
	savePersisted(key(requestId), items);
}

export function clearPersistedComments(requestId: string): void {
	clearPersisted(key(requestId));
}

export function prunePersistedComments(): void {
	prunePersisted(PREFIX);
}
