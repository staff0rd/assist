import { CONSOLE_MAX_AGE_MS, CONSOLE_MAX_ENTRIES } from "./types";

export type ConsoleLimits = { maxAgeMs: number; maxEntries: number };

const DEFAULT_LIMITS: ConsoleLimits = {
	maxAgeMs: CONSOLE_MAX_AGE_MS,
	maxEntries: CONSOLE_MAX_ENTRIES,
};

function trimOldest(store: IDBObjectStore, maxEntries: number): void {
	const counted = store.count();
	counted.onsuccess = () => {
		const excess = counted.result - maxEntries;
		if (excess <= 0) return;
		const oldest = store.openCursor();
		let skipped = excess === 1;
		oldest.onsuccess = () => {
			const cursor = oldest.result;
			if (!cursor) return;
			if (!skipped) {
				skipped = true;
				cursor.advance(excess - 1);
				return;
			}
			store.delete(IDBKeyRange.upperBound(cursor.primaryKey));
		};
	};
}

export function pruneConsoleStore(
	store: IDBObjectStore,
	now: number,
	{ maxAgeMs, maxEntries }: ConsoleLimits = DEFAULT_LIMITS,
): void {
	const expired = store
		.index("time")
		.openCursor(IDBKeyRange.upperBound(now - maxAgeMs, true));
	expired.onsuccess = () => {
		const cursor = expired.result;
		if (!cursor) {
			trimOldest(store, maxEntries);
			return;
		}
		cursor.delete();
		cursor.continue();
	};
}
