import type { ConversationEvent, ToolOperation } from "../types";
import { codexInnerCallView } from "./codexInnerCallView";
import { condensePreview } from "./condensePreview";
import { parseCodexExecWrapper } from "./parseCodexExecWrapper";

export function codexExecEvents(
	input: string,
	operations: ToolOperation[],
	at?: string,
): ConversationEvent[] {
	const calls = parseCodexExecWrapper(input) ?? [];
	const events = calls.flatMap((call, i): ConversationEvent[] => {
		const view = codexInnerCallView(call);
		if (!view) return [];
		const ops = i === 0 ? operations : [];
		return [{ kind: "tool", tool: call.tool, ...view, operations: ops, at }];
	});
	if (calls.length && events.length === calls.length) return events;
	return [
		{
			kind: "tool",
			tool: "exec",
			target: input.trim(),
			label: condensePreview(input),
			operations,
			at,
		},
	];
}
