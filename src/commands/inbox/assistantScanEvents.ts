import { describeInboxScanTool } from "./describeInboxScanTool";
import type { InboxScanEvent } from "./InboxScanEvent";

const MAX_TEXT = 500;

type ContentBlock = {
	type?: unknown;
	name?: unknown;
	input?: unknown;
	text?: unknown;
};

function truncate(text: string): string {
	const trimmed = text.trim();
	return trimmed.length <= MAX_TEXT
		? trimmed
		: `${trimmed.slice(0, MAX_TEXT - 1)}…`;
}

function blockEvent(
	block: ContentBlock,
): Omit<InboxScanEvent, "at"> | undefined {
	if (block.type === "tool_use") {
		const name = typeof block.name === "string" ? block.name : "tool";
		return { kind: "tool", ...describeInboxScanTool(name, block.input) };
	}
	if (
		block.type === "text" &&
		typeof block.text === "string" &&
		block.text.trim()
	)
		return { kind: "text", label: "Assistant", detail: truncate(block.text) };
	return undefined;
}

export function assistantScanEvents(content: unknown): InboxScanEvent[] {
	if (!Array.isArray(content)) return [];
	const at = new Date().toISOString();
	return (content as ContentBlock[])
		.map(blockEvent)
		.filter((event) => event !== undefined)
		.map((event) => ({ at, ...event }));
}
