import {
	loadPersistedPrChain,
	prunePersistedPrChains,
} from "./loadPersistedPrChain";
import type { PrPreviewChain } from "./PrPreviewChain";

export function initialPrChain(
	isPr: boolean,
	sessionId: string | undefined,
	resolvedDraft: boolean,
): PrPreviewChain {
	if (!isPr)
		return {
			reviewAfter: false,
			announceAfter: false,
			draft: false,
			autoMerge: false,
		};
	prunePersistedPrChains();
	const saved = loadPersistedPrChain(sessionId);
	return {
		reviewAfter: saved?.reviewAfter ?? true,
		announceAfter: saved?.announceAfter ?? true,
		draft: saved?.draft ?? resolvedDraft,
		autoMerge: saved?.autoMerge ?? false,
	};
}
