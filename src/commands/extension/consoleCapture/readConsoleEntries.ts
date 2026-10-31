import type { ConsoleEntry, ConsoleQuery } from "./types";
import { withConsoleStore } from "./withConsoleStore";

function matches(
	entry: ConsoleEntry,
	{ tabId, since }: ConsoleQuery,
	needle: string | undefined,
): boolean {
	if (tabId !== undefined && entry.tabId !== tabId) return false;
	if (since !== undefined && entry.time < since) return false;
	if (!needle) return true;
	return [entry.message, entry.stack, entry.url].some((text) =>
		text?.toLowerCase().includes(needle),
	);
}

export async function readConsoleEntries(
	query: ConsoleQuery,
): Promise<ConsoleEntry[]> {
	const needle = query.grep?.toLowerCase();
	const newestFirst = await withConsoleStore("readonly", (store) => {
		const found: ConsoleEntry[] = [];
		const request = store.openCursor(null, "prev");
		request.onsuccess = () => {
			const cursor = request.result;
			if (!cursor || found.length >= query.limit) return;
			const { id: _id, ...entry } = cursor.value as ConsoleEntry & {
				id: number;
			};
			if (matches(entry, query, needle)) found.push(entry);
			cursor.continue();
		};
		return found;
	});
	return newestFirst.reverse();
}
