import { assistantScanEvents } from "./assistantScanEvents";
import { createScanUsageTracker } from "./createScanUsageTracker";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { parseInboxScanOutput } from "./parseInboxScanOutput";

type StreamEvent = {
	type?: unknown;
	message?: { id?: unknown; content?: unknown; usage?: unknown };
	total_cost_usd?: unknown;
	duration_ms?: unknown;
};

export type InboxScanResult = {
	messages: FlaggedMessage[];
	usage: InboxScanUsage;
};

export function createInboxScanParser({
	onEvent = () => {},
	onUsage = () => {},
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
			let event: StreamEvent;
			try {
				event = JSON.parse(line) as StreamEvent;
			} catch {
				return;
			}
			if (event.type === "assistant") onAssistant(event.message);
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
