import { assistantScanEvents } from "./assistantScanEvents";
import type { InboxScanEvent } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { parseInboxScanOutput } from "./parseInboxScanOutput";

type StreamEvent = {
	type?: unknown;
	message?: { content?: unknown };
};

export function createInboxScanParser(
	onEvent: (event: InboxScanEvent) => void,
) {
	let resultLine: string | undefined;
	return {
		onLine(line: string): void {
			let event: StreamEvent;
			try {
				event = JSON.parse(line) as StreamEvent;
			} catch {
				return;
			}
			if (event.type === "assistant")
				for (const scanEvent of assistantScanEvents(event.message?.content))
					onEvent(scanEvent);
			else if (event.type === "result") resultLine = line;
		},
		finish(failure: string): FlaggedMessage[] {
			if (!resultLine) throw new Error(`Inbox scan failed: ${failure}`);
			return parseInboxScanOutput(resultLine);
		},
	};
}
