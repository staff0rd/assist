import type { ConnectorRunEvent } from "../../shared/harnessAdapters/types";
import { describeInboxScanTool } from "./describeInboxScanTool";
import type { InboxScanEvent } from "./InboxScanEvent";

const MAX_TEXT = 500;

export function inboxProgressEvent(
	event: ConnectorRunEvent,
): InboxScanEvent | undefined {
	const at = new Date().toISOString();
	const tokens =
		"tokens" in event && event.tokens !== undefined
			? { tokens: event.tokens }
			: {};
	if (event.type === "toolCall")
		return {
			at,
			kind: "tool",
			label: event.label,
			detail: describeInboxScanTool(event.input),
			...tokens,
		};
	if (event.type === "text")
		return {
			at,
			kind: "text",
			label: "Assistant",
			detail: truncate(event.text),
			...tokens,
		};
	return undefined;
}

function truncate(text: string): string {
	const trimmed = text.trim();
	return trimmed.length <= MAX_TEXT
		? trimmed
		: `${trimmed.slice(0, MAX_TEXT - 1)}…`;
}
