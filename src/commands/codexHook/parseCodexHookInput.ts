type CodexHookInput = {
	hook_event_name?: string;
	cwd?: unknown;
	transcript_path?: unknown;
	tool_name?: string;
	tool_input?: { command?: unknown };
};

const SUPPORTED_TOOLS = new Set(["Bash", "PowerShell"]);

export type ParsedInput = {
	event: string;
	cwd?: string;
	transcriptPath?: string;
	toolName?: string;
	command?: string;
};

function optionalString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
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
		const command = data.tool_input?.command;
		if (typeof command !== "string" || !command.trim()) return base;
		if (!data.tool_name || !SUPPORTED_TOOLS.has(data.tool_name)) return base;
		return { ...base, toolName: data.tool_name, command: command.trim() };
	} catch {
		return undefined;
	}
}
