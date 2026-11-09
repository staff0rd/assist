import { editTexts } from "./editTexts";
import type { NativeToolCall, ToolOperation } from "./types";

const COMMAND_TOOLS = new Set(["Bash", "PowerShell"]);
const READ_TOOLS = new Set(["Read", "Grep", "Glob"]);
const READ_FIELDS = ["file_path", "path", "pattern", "glob"];
const WRITE_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

function strings(values: unknown[]): string[] {
	return values.filter((value): value is string => typeof value === "string");
}

function incomingContents(input: Record<string, unknown>): string[] {
	return [
		...strings([input.content, input.new_string, input.new_source]),
		...editTexts(input, "new_string"),
	];
}

export function claudeToolOperations({
	toolName,
	toolInput,
}: NativeToolCall): ToolOperation[] {
	if (COMMAND_TOOLS.has(toolName)) {
		const { command } = toolInput;
		return typeof command === "string"
			? [{ kind: "command", tool: toolName, command: command.trim() }]
			: [];
	}
	if (READ_TOOLS.has(toolName)) {
		const paths = strings(READ_FIELDS.map((field) => toolInput[field]));
		return paths.length ? [{ kind: "fileRead", tool: toolName, paths }] : [];
	}
	if (WRITE_TOOLS.has(toolName)) {
		const [path] = strings([toolInput.file_path, toolInput.notebook_path]);
		return path
			? [
					{
						kind: "fileWrite",
						tool: toolName,
						path,
						contents: incomingContents(toolInput),
					},
				]
			: [];
	}
	if (toolName === "AskUserQuestion" && Array.isArray(toolInput.questions))
		return [
			{
				kind: "question",
				tool: toolName,
				questionsJson: JSON.stringify({ questions: toolInput.questions }),
			},
		];
	return [];
}
