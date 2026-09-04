type ParsedInput =
	| { kind: "command"; toolName: string; command: string }
	| { kind: "path"; toolName: string; command: string; paths: string[] };

type HookInput = {
	hook_event_name: string;
	tool_name: string;
	tool_input: Record<string, unknown>;
};

const COMMAND_TOOLS = new Set(["Bash", "PowerShell"]);

const PATH_TOOLS = new Set(["Read", "Grep", "Glob"]);

const PATH_FIELDS = ["file_path", "path", "pattern", "glob"];

export function tryParseInput(raw: string): ParsedInput | undefined {
	try {
		const data: HookInput = JSON.parse(raw);
		const toolInput = data.tool_input ?? {};

		if (COMMAND_TOOLS.has(data.tool_name)) {
			const command = toolInput.command;
			if (typeof command !== "string") return undefined;
			return {
				kind: "command",
				toolName: data.tool_name,
				command: command.trim(),
			};
		}

		if (PATH_TOOLS.has(data.tool_name)) {
			const paths = PATH_FIELDS.map((field) => toolInput[field]).filter(
				(value): value is string => typeof value === "string",
			);
			if (paths.length === 0) return undefined;
			return {
				kind: "path",
				toolName: data.tool_name,
				command: paths.join(" "),
				paths,
			};
		}

		return undefined;
	} catch {
		return undefined;
	}
}
