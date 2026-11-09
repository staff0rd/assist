import type { NativeToolCall } from "../../shared/harnessAdapters/types";

type CodexHookInput = {
	hook_event_name?: string;
	cwd?: unknown;
	transcript_path?: unknown;
	session_id?: unknown;
	tool_name?: unknown;
	tool_input?: unknown;
};

export type ParsedInput = {
	event: string;
	cwd?: string;
	transcriptPath?: string;
	sessionId?: string;
	toolCall?: NativeToolCall;
};

function optionalString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function toolInputOf(value: unknown): Record<string, unknown> {
	if (typeof value === "string") return { command: value };
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

export function parseCodexHookInput(raw: string): ParsedInput | undefined {
	try {
		const data: CodexHookInput = JSON.parse(raw);
		const base: ParsedInput = {
			event: data.hook_event_name ?? "PreToolUse",
			cwd: optionalString(data.cwd),
		};
		const transcriptPath = optionalString(data.transcript_path);
		if (transcriptPath) base.transcriptPath = transcriptPath;
		const sessionId = optionalString(data.session_id);
		if (sessionId) base.sessionId = sessionId;
		const toolName = optionalString(data.tool_name);
		if (!toolName) return base;
		return {
			...base,
			toolCall: { toolName, toolInput: toolInputOf(data.tool_input) },
		};
	} catch {
		return undefined;
	}
}
