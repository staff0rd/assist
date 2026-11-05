import { assistantScanEvents } from "./assistantScanEvents";
import type { createScanUsageTracker } from "./createScanUsageTracker";
import type { InboxScanListener } from "./InboxScanEvent";
import type { ScanStreamEvent } from "./parseScanStreamLine";

export function handleAssistantTurn(
	message: ScanStreamEvent["message"],
	usage: ReturnType<typeof createScanUsageTracker>,
	{ onEvent = () => {}, onUsage = () => {} }: InboxScanListener,
): void {
	const counted = usage.addTurn(message?.id, message?.usage);
	for (const scanEvent of assistantScanEvents(message?.content)) {
		const tokens = usage.takeTurnTokens();
		onEvent(tokens === undefined ? scanEvent : { ...scanEvent, tokens });
	}
	if (counted) onUsage(usage.current());
}
