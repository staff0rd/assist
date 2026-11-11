import { claudeContentBlocksOf } from "./claudeContentBlocksOf";

type Entry = Record<string, unknown>;

const IGNORED_ENTRY_TYPES = new Set([
	"ai-title",
	"api-request",
	"api-request-blob",
	"api-request-shape",
	"artifact-autoreact-ledger",
	"artifact-comment-monitor",
	"atis-latch",
	"attachment",
	"cost-state",
	"custom-title",
	"file-history-delta",
	"file-history-snapshot",
	"fork-context-ref",
	"frame-link",
	"isolation-latch",
	"last-prompt",
	"mode",
	"permission-mode",
	"pr-link",
	"progress",
	"queue-operation",
	"session-owner",
	"summary",
	"system",
	"tools-used",
]);

const BLOCK_TYPES = new Map([
	["user", new Set(["text", "tool_result", "image", "document"])],
	["assistant", new Set(["text", "thinking", "redacted_thinking", "tool_use"])],
]);

function blockShapes(entry: Entry, known: Set<string>): string[] {
	const content = (entry.message as { content?: unknown } | undefined)?.content;
	if (typeof content === "string") return [];
	if (!Array.isArray(content)) return [`${String(entry.type)}/content`];
	return claudeContentBlocksOf(content)
		.map((block) => String(block.type))
		.filter((type) => !known.has(type))
		.map((type) => `${String(entry.type)}/${type}`);
}

export function claudeUnrecognisedShapes(entries: Entry[]): string[] {
	const shapes = entries.flatMap((entry): string[] => {
		const type = String(entry.type);
		const known = BLOCK_TYPES.get(type);
		if (known) return blockShapes(entry, known);
		return IGNORED_ENTRY_TYPES.has(type) ? [] : [type];
	});
	return [...new Set(shapes)];
}
