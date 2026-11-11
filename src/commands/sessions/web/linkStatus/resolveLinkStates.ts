import {
	fetchLinkStateChunks,
	type QueryLinkStates,
} from "./fetchLinkStateChunks";
import { linkRefKey } from "./linkRefKey";
import type { LinkRef, LinkState, LinkStates } from "./LinkState";
import { linkStateCache } from "./linkStateCache";
import { queryLinkStates } from "./queryLinkStates";

const inFlight = new Map<string, Promise<LinkState | null>>();

function startFetch(refs: LinkRef[], query: QueryLinkStates): void {
	if (refs.length === 0) return;
	const batch = fetchLinkStateChunks(refs, query);
	for (const ref of refs) {
		const key = linkRefKey(ref);
		const pending = batch.then((resolved) => resolved.get(key) ?? null);
		inFlight.set(key, pending);
		void pending.finally(() => {
			if (inFlight.get(key) === pending) inFlight.delete(key);
		});
	}
}

export async function resolveLinkStates(
	refs: LinkRef[],
	query: QueryLinkStates = queryLinkStates,
): Promise<LinkStates> {
	const unique = new Map(refs.map((ref) => [linkRefKey(ref), ref]));
	const toFetch = [...unique]
		.filter(
			([key]) => linkStateCache.get(key) === undefined && !inFlight.has(key),
		)
		.map(([, ref]) => ref);
	startFetch(toFetch, query);
	const states: LinkStates = {};
	await Promise.all(
		[...unique.keys()].map(async (key) => {
			const state =
				linkStateCache.get(key) ?? (await inFlight.get(key)) ?? null;
			if (state) states[key] = state;
		}),
	);
	return states;
}

export function clearLinkStateCache(): void {
	linkStateCache.clear();
	inFlight.clear();
}
