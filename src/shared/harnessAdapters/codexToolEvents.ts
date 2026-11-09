import { codexToolTarget } from "../../commands/sessions/shared/codex/codexToolTarget";
import { rolloutString } from "../../commands/sessions/shared/codex/parseRolloutEntry";
import { codexContentText } from "./codexContentText";
import { codexToolOperations } from "./codexToolOperations";
import type { ConversationEvent, ToolOperation } from "./types";

type Payload = Record<string, unknown>;

const TOOL_CALLS = new Set([
	"function_call",
	"custom_tool_call",
	"local_shell_call",
]);
const TOOL_OUTPUTS = new Set([
	"function_call_output",
	"custom_tool_call_output",
]);

function operations(payload: Payload, target: string): ToolOperation[] {
	const name = rolloutString(payload.name);
	const input = rolloutString(payload.input);
	if (payload.type === "custom_tool_call")
		return codexToolOperations({
			toolName: input.includes("*** Begin Patch") ? "apply_patch" : name,
			toolInput: { input },
		});
	return target
		? codexToolOperations({ toolName: "Bash", toolInput: { command: target } })
		: [];
}

export function codexToolEvents(
	payload: Payload,
	at?: string,
): ConversationEvent[] {
	const type = rolloutString(payload.type);
	if (TOOL_CALLS.has(type)) {
		const target = codexToolTarget(payload);
		return [
			{
				kind: "tool",
				tool: rolloutString(payload.name) || "tool",
				target,
				operations: operations(payload, target),
				at,
			},
		];
	}
	if (TOOL_OUTPUTS.has(type)) {
		const text = codexContentText(payload.output).trim();
		return text ? [{ kind: "toolResult", text, at }] : [];
	}
	return [];
}
