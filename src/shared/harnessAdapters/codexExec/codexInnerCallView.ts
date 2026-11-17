import type { ConversationEvent, ToolInputField } from "../types";
import { toolInputFields } from "../toolInputFields";
import { condensePreview } from "./condensePreview";
import type { CodexInnerCall } from "./parseCodexExecWrapper";

type ToolEvent = Extract<ConversationEvent, { kind: "tool" }>;
type InnerCallView = Pick<ToolEvent, "target" | "label" | "fields">;

function execCommandView(args: CodexInnerCall["args"]): InnerCallView | null {
	const { cmd } = args;
	if (typeof cmd !== "string" || !cmd.trim()) return null;
	return {
		target: cmd,
		label: condensePreview(cmd),
		fields: toolInputFields(args),
	};
}

function writeStdinView(args: CodexInnerCall["args"]): InnerCallView | null {
	const { session_id: session, chars = "" } = args;
	if (typeof session !== "number" && typeof session !== "string") return null;
	if (typeof chars !== "string") return null;
	const action = chars
		? `input ${condensePreview(JSON.stringify(chars))}`
		: "poll";
	const fields: ToolInputField[] = toolInputFields(args).map((field) =>
		field.name === "chars" ? { ...field, value: JSON.stringify(chars) } : field,
	);
	return {
		target: `session ${session}`,
		label: `session ${session} · ${action}`,
		fields,
	};
}

export function codexInnerCallView(call: CodexInnerCall): InnerCallView | null {
	return call.tool === "exec_command"
		? execCommandView(call.args)
		: writeStdinView(call.args);
}
