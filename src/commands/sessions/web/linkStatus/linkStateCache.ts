import type { LinkState } from "./LinkState";

const CACHE_TTL_MS = 5 * 60_000;
const entries = new Map<string, { at: number; state: LinkState | null }>();

export const linkStateCache = {
	get(key: string): LinkState | null | undefined {
		const hit = entries.get(key);
		if (!hit) return undefined;
		if (Date.now() - hit.at < CACHE_TTL_MS) return hit.state;
		entries.delete(key);
		return undefined;
	},
	set(key: string, state: LinkState | null): void {
		entries.set(key, { at: Date.now(), state });
	},
	clear(): void {
		entries.clear();
	},
};
