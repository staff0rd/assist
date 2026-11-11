import { codexAsyncQuestionOperation } from "./codexAsyncQuestionOperation";
import type { NativeToolCall, ToolOperation } from "./types";
import { patchWrites } from "./patchWrites";
import { patchText } from "./patchText";

const COMMAND_TOOLS = new Set(["Bash", "PowerShell"]);
const PATCH_TOOLS = new Set(["apply_patch", "Edit", "Write"]);
const PATCH_MARKER = "*** Begin Patch";

export function codexToolOperations({
	toolName,
	toolInput,
}: NativeToolCall): ToolOperation[] {
	if (toolName === "request_user_input" && Array.isArray(toolInput.questions))
		return [
			{
				kind: "question",
				tool: toolName,
				questionsJson: JSON.stringify({
					questions: toolInput.questions.map(
						({ question, header, options }) => ({
							question,
							header,
							options,
							multiSelect: false,
						}),
					),
				}),
			},
		];
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
	if (!PATCH_TOOLS.has(toolName))
		return codexAsyncQuestionOperation({ toolName, toolInput });
	const patch = patchText(toolInput);
	if (patch) return patchWrites(toolName, patch);
	const { file_path: path, content } = toolInput;
	if (typeof path !== "string") return [];
	const contents = typeof content === "string" ? [content] : [];
	return [{ kind: "fileWrite", tool: toolName, path, contents }];
}
