import { withConsoleStore } from "./withConsoleStore";

export function clearConsoleEntries(): Promise<void> {
	return withConsoleStore("readwrite", (store) => {
		store.clear();
	});
}
