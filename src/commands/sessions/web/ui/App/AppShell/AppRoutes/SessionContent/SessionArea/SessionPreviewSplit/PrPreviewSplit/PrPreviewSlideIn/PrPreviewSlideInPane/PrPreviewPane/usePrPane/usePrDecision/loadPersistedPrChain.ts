import {
	clearPersisted,
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../../../../../../../../loadPersisted";
import type { PrPreviewChain } from "../../../../../../../../../../../../PrPreviewChain";

const PREFIX = "assist:pr-preview-chain:";

const key = (sessionId: string) => `${PREFIX}${sessionId}`;

export function loadPersistedPrChain(
	sessionId: string | undefined,
): Partial<PrPreviewChain> | undefined {
	if (!sessionId) return undefined;
	return loadPersisted<Partial<PrPreviewChain>>(key(sessionId))[0];
}

export function savePersistedPrChain(
	sessionId: string | undefined,
	chain: PrPreviewChain,
): void {
	if (!sessionId) return;
	savePersisted(key(sessionId), [chain]);
}

export function clearPersistedPrChain(sessionId: string | undefined): void {
	if (!sessionId) return;
	clearPersisted(key(sessionId));
}

export function prunePersistedPrChains(): void {
	prunePersisted(PREFIX);
}
