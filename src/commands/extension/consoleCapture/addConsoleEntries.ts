import { type ConsoleLimits, pruneConsoleStore } from "./pruneConsoleStore";
import type { ConsoleEntry } from "./types";
import { withConsoleStore } from "./withConsoleStore";

export function addConsoleEntries(
	entries: ConsoleEntry[],
	now: number,
	limits?: ConsoleLimits,
): Promise<void> {
	return withConsoleStore("readwrite", (store) => {
		for (const entry of entries) store.add(entry);
		pruneConsoleStore(store, now, limits);
	});
}
