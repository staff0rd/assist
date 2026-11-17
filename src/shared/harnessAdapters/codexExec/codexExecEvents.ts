import type { ConversationEvent, ToolOperation } from "../types";
import { codexInnerCallView } from "./codexInnerCallView";
import { condensePreview } from "./condensePreview";
import { parseCodexExecWrapper } from "./parseCodexExecWrapper";

function rawEvent(
	source: string,
	operations: ToolOperation[],
	at?: string,
): ConversationEvent {
	const target = source.trim();
	return {
		kind: "tool",
		tool: "exec",
		target,
		label: condensePreview(target),
		operations,
		at,
	};
}

export function codexExecEvents(
	input: string,
	operations: ToolOperation[],
	at?: string,
): ConversationEvent[] {
	const parts = parseCodexExecWrapper(input);
	if (!parts) return [rawEvent(input, operations, at)];
	return parts.map((part, i) => {
		const ops = i === 0 ? operations : [];
		if (part.kind === "raw") return rawEvent(part.source, ops, at);
		const view = codexInnerCallView(part.call);
		if (!view) return rawEvent(JSON.stringify(part.call), ops, at);
		return { kind: "tool", tool: part.call.tool, ...view, operations: ops, at };
	});
}
