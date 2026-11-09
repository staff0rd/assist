import { editTexts } from "./editTexts";
import type { NativeToolCall, ToolOperation } from "./types";

const COMMAND_TOOLS: Record<string, string> = {
	bash: "Bash",
	powershell: "PowerShell",
};
const READ_TOOLS = new Set(["read", "grep", "find", "ls"]);
const WRITE_TOOLS = new Set(["write", "edit"]);

function stringField(
	input: Record<string, unknown>,
	...fields: string[]
): string | undefined {
	return fields
		.map((field) => input[field])
		.find((value): value is string => typeof value === "string");
}

function incomingContents(input: Record<string, unknown>): string[] {
	return [
		stringField(input, "content"),
		stringField(input, "newText", "new_string"),
		...editTexts(input, "newText", "new_string"),
	].filter((value): value is string => value !== undefined);
}

export function piToolOperations({
	toolName,
	toolInput,
}: NativeToolCall): ToolOperation[] {
	const name = toolName.toLowerCase();
	const commandTool = COMMAND_TOOLS[name];
	if (commandTool) {
		const command = stringField(toolInput, "command")?.trim();
		return command ? [{ kind: "command", tool: commandTool, command }] : [];
	}
	const path = stringField(toolInput, "path", "file_path", "pattern");
	if (READ_TOOLS.has(name))
		return path ? [{ kind: "fileRead", tool: toolName, paths: [path] }] : [];
	if (WRITE_TOOLS.has(name) && path)
		return [
			{
				kind: "fileWrite",
				tool: toolName,
				path,
				contents: incomingContents(toolInput),
			},
		];
	return [];
}
