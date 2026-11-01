import { assistantScanEvents } from "./assistantScanEvents";
import { createScanUsageTracker } from "./createScanUsageTracker";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { parseInboxScanOutput } from "./parseInboxScanOutput";
import {
	parseScanStreamLine,
	type ScanStreamEvent as StreamEvent,
} from "./parseScanStreamLine";

export type InboxScanResult = {
	messages: FlaggedMessage[];
	usage: InboxScanUsage;
};

export function createInboxScanParser({
	onEvent = () => {},
	onUsage = () => {},
	onModel = () => {},
}: InboxScanListener = {}) {
	const usage = createScanUsageTracker();
	let resultLine: string | undefined;

	const onAssistant = (message: StreamEvent["message"]) => {
		const counted = usage.addTurn(message?.id, message?.usage);
		for (const scanEvent of assistantScanEvents(message?.content)) {
			const tokens = usage.takeTurnTokens();
			onEvent(tokens === undefined ? scanEvent : { ...scanEvent, tokens });
		}
		if (counted) onUsage(usage.current());
	};

	return {
		onLine(line: string): void {
			const event = parseScanStreamLine(line);
			if (!event) return;
			if (event.type === "system" && typeof event.model === "string")
				onModel(event.model);
			else if (event.type === "assistant") onAssistant(event.message);
			else if (event.type === "result") {
				resultLine = line;
				usage.finish(event);
				onUsage(usage.current());
			}
		},
		finish(failure: string): InboxScanResult {
			if (!resultLine) throw new Error(`Inbox scan failed: ${failure}`);
			return {
				messages: parseInboxScanOutput(resultLine),
				usage: usage.current(),
			};
		},
	};
}
