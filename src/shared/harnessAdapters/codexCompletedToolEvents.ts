import { rolloutString } from "../../commands/sessions/shared/codex/parseRolloutEntry";
import type { ConversationEvent, ToolOperation } from "./types";

type Item = Record<string, unknown>;

function record(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function fileWrites(changes: Record<string, unknown>): ToolOperation[] {
	return Object.entries(changes).flatMap(([path, change]): ToolOperation[] => {
		const { content, move_path: movePath } = record(change);
		const contents = typeof content === "string" ? [content] : [];
		const write: ToolOperation = {
			kind: "fileWrite",
			tool: "apply_patch",
			path,
			contents,
		};
		return typeof movePath === "string"
			? [write, { ...write, path: movePath }]
			: [write];
	});
}

export function codexCompletedToolEvents(
	item: Item,
	at?: string,
): ConversationEvent[] {
	if (item.type === "FileChange") {
		const operations = fileWrites(record(item.changes));
		if (operations.length === 0) return [];
		const target = operations
			.map((op) => (op.kind === "fileWrite" ? op.path : ""))
			.join(", ");
		return [{ kind: "tool", tool: "apply_patch", target, operations, at }];
	}
	if (item.type === "CommandExecution") {
		const text = rolloutString(item.aggregated_output).trim();
		return text ? [{ kind: "toolResult", text, at }] : [];
	}
	return [];
}
