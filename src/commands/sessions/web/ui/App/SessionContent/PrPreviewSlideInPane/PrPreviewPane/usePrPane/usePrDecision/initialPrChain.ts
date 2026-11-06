import {
	loadPersistedPrChain,
	prunePersistedPrChains,
} from "./loadPersistedPrChain";
import type { PrPreviewChain } from "../../../../../../PrPreviewChain";

export type PrChainDefaults = Pick<PrPreviewChain, "draft" | "reviewAfter">;

export function initialPrChain(
	isPr: boolean,
	sessionId: string | undefined,
	defaults: PrChainDefaults,
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
		reviewAfter: saved?.reviewAfter ?? defaults.reviewAfter,
		announceAfter: saved?.announceAfter ?? true,
		draft: saved?.draft ?? defaults.draft,
		autoMerge: saved?.autoMerge ?? false,
	};
}
