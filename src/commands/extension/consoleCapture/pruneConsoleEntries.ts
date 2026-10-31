import { pruneConsoleStore } from "./pruneConsoleStore";
import { withConsoleStore } from "./withConsoleStore";

export function pruneConsoleEntries(now: number): Promise<void> {
	return withConsoleStore("readwrite", (store) =>
		pruneConsoleStore(store, now),
	);
}
