type CodexHookInput = {
	hook_event_name?: string;
	cwd?: unknown;
	tool_name?: string;
	tool_input?: { command?: unknown };
};

const SUPPORTED_TOOLS = new Set(["Bash", "PowerShell"]);

export type ParsedInput = {
	event: string;
	cwd?: string;
	toolName?: string;
	command?: string;
};

export function parseCodexHookInput(raw: string): ParsedInput | undefined {
	try {
		const data: CodexHookInput = JSON.parse(raw);
		const event = data.hook_event_name ?? "PreToolUse";
		const cwd = typeof data.cwd === "string" ? data.cwd : undefined;
		const command = data.tool_input?.command;
		if (typeof command !== "string" || !command.trim()) return { event, cwd };
		if (!data.tool_name || !SUPPORTED_TOOLS.has(data.tool_name))
			return { event, cwd };
		return { event, cwd, toolName: data.tool_name, command: command.trim() };
	} catch {
		return undefined;
	}
}
