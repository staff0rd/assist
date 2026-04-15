import { iterateUserMessages } from "./iterateUserMessages";

/**
 * Scan session JSONL for backlog item references.
 * Returns unique backlog IDs found in the session.
 *
 * Detected patterns (in user messages only):
 * - `backlog run <id>` / `backlog run <id> ...`
 * - `#<id>` (standalone number after hash)
 * - `/next-backlog-item` skill invocations with nearby IDs
 * - `backlog item #<id>` / `backlog #<id>`
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

function extractBacklogIds(text: string): number[] {
	const ids: number[] = [];

	// backlog run 42, backlog run 42 1
	for (const m of text.matchAll(/backlog\s+run\s+(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	// backlog item #42, backlog #42
	for (const m of text.matchAll(/backlog\s+(?:item\s+)?#(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	// backlog phase-done 42
	for (const m of text.matchAll(/backlog\s+phase-done\s+(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	// backlog comment 42
	for (const m of text.matchAll(/backlog\s+comment\s+(\d+)/gi)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	// Standalone #42 references (word boundary, not inside a URL or hex color)
	for (const m of text.matchAll(/(?:^|[\s(])#(\d{1,4})(?=[\s).,;:!?]|$)/gm)) {
		ids.push(Number.parseInt(m[1], 10));
	}

	return ids;
}
