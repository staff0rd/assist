import { createGmailCoverage } from "./createGmailCoverage";
import { createScanUsageTracker } from "./createScanUsageTracker";
import { handleAssistantTurn } from "./handleAssistantTurn";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { parseInboxScanOutput } from "./parseInboxScanOutput";
import { parseScanStreamLine } from "./parseScanStreamLine";

export type InboxScanResult = {
	messages: FlaggedMessage[];
	usage: InboxScanUsage;
	threads: { found: string[]; opened: string[] };
};

export function createInboxScanParser(listener: InboxScanListener = {}) {
	const { onUsage = () => {}, onModel = () => {} } = listener;
	const usage = createScanUsageTracker();
	const coverage = createGmailCoverage();
	let resultLine: string | undefined;

	return {
		onLine(line: string): void {
			const event = parseScanStreamLine(line);
			if (!event) return;
			if (event.type === "system" && typeof event.model === "string")
				onModel(event.model);
			else if (event.type === "assistant") {
				coverage.onAssistant(event.message?.content);
				handleAssistantTurn(event.message, usage, listener);
			} else if (event.type === "user") coverage.onUser(event.message?.content);
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
				threads: coverage.current(),
			};
		},
	};
}
