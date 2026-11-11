import { linkRefKey } from "./linkRefKey";
import type { LinkRef, LinkState } from "./LinkState";
import { linkStateCache } from "./linkStateCache";

export type QueryLinkStates = (
	refs: LinkRef[],
) => Promise<(LinkState | null)[]>;

const CHUNK_SIZE = 100;

export async function fetchLinkStateChunks(
	refs: LinkRef[],
	query: QueryLinkStates,
): Promise<Map<string, LinkState | null>> {
	const resolved = new Map<string, LinkState | null>();
	for (let start = 0; start < refs.length; start += CHUNK_SIZE) {
		const chunk = refs.slice(start, start + CHUNK_SIZE);
		const states = await query(chunk).catch(() => undefined);
		if (!states) continue;
		chunk.forEach((ref, i) => {
			const key = linkRefKey(ref);
			const state = states[i] ?? null;
			resolved.set(key, state);
			linkStateCache.set(key, state);
		});
	}
	return resolved;
}
