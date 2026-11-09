import type { ConnectorRunEvent } from "../../shared/harnessAdapters/types";
import { openedThreadId } from "./openedThreadId";
import { searchResultThreadIds } from "./searchResultThreadIds";

export function createGmailCoverage() {
	const searches = new Set<string>();
	const found = new Set<string>();
	const opened = new Set<string>();

	return {
		onEvent(event: ConnectorRunEvent): void {
			if (event.type === "toolCall") {
				if (event.tool === "gmail.searchThreads") searches.add(event.callId);
				else if (event.tool === "gmail.getThread") {
					const id = openedThreadId(event.input);
					if (id) opened.add(id);
				}
			} else if (event.type === "toolResult" && searches.has(event.callId))
				for (const id of searchResultThreadIds(event.text)) found.add(id);
		},
		current: () => ({ found: [...found], opened: [...opened] }),
	};
}
