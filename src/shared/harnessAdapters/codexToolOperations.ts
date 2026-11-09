import { parseApplyPatch } from "./parseApplyPatch";
import type { NativeToolCall, ToolOperation } from "./types";

const COMMAND_TOOLS = new Set(["Bash", "PowerShell"]);
const PATCH_TOOLS = new Set(["apply_patch", "Edit", "Write"]);
const PATCH_MARKER = "*** Begin Patch";

function patchText(input: Record<string, unknown>): string | undefined {
	const candidates = [
		input.command,
		input.input,
		input.patch,
		...(Array.isArray(input.command) ? input.command : []),
	];
	return candidates.find(
		(value): value is string =>
			typeof value === "string" && value.includes(PATCH_MARKER),
	);
}

function patchWrites(tool: string, patch: string): ToolOperation[] {
	return parseApplyPatch(patch).map(({ path, contents }) => ({
		kind: "fileWrite",
		tool,
		path,
		contents,
	}));
}

export function codexToolOperations({
	toolName,
	toolInput,
}: NativeToolCall): ToolOperation[] {
	if (COMMAND_TOOLS.has(toolName)) {
		const { command } = toolInput;
		if (typeof command !== "string" || !command.trim()) return [];
		const operations: ToolOperation[] = [
			{ kind: "command", tool: toolName, command: command.trim() },
		];
		return command.includes(PATCH_MARKER)
			? [...operations, ...patchWrites(toolName, command)]
			: operations;
	}
	if (!PATCH_TOOLS.has(toolName)) return [];
	const patch = patchText(toolInput);
	if (patch) return patchWrites(toolName, patch);
	const { file_path: path, content } = toolInput;
	if (typeof path !== "string") return [];
	const contents = typeof content === "string" ? [content] : [];
	return [{ kind: "fileWrite", tool: toolName, path, contents }];
}
