import { iterateUserMessages } from "./iterateUserMessages";

/**
 * Scan session JSONL for backlog item references.
 * Returns unique backlog IDs found in the session.
 *
 * Detected patterns (in user messages only). Backlog item ids carry an
 * `a` prefix (e.g. a42); a bare `#42` is a GitHub/Jira ref, not a backlog ref.
 * - `backlog run a<id>` / `backlog run a<id> ...`
 * - `a<id>` (standalone, word-bounded)
 * - `backlog item a<id>` / `backlog a<id>`
 */
export function scanSessionBacklogRefs(filePath: string): number[] {
	const ids = new Set<number>();

	for (const text of iterateUserMessages(filePath, Number.MAX_SAFE_INTEGER)) {
		for (const id of extractBacklogIds(text)) {
			ids.add(id);
		}
	}

	return [...ids].sort((a, b) => a - b);
}

export function extractBacklogIds(text: string): number[] {
	const ids: number[] = [];

	for (const m of text.matchAll(/backlog\s+run\s+a(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	for (const m of text.matchAll(/backlog\s+(?:item\s+)?a(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	for (const m of text.matchAll(/backlog\s+phase-done\s+a(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	for (const m of text.matchAll(/backlog\s+comment\s+a(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	for (const m of text.matchAll(/(?:^|[\s(])a(\d{1,4})(?=[\s).,;:!?]|$)/gm)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	return ids;
}
