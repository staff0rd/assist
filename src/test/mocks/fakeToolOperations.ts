import type {
	NativeToolCall,
	ToolOperation,
} from "../../shared/harnessAdapters/types";

export function fakeToolOperations({
	toolName,
	toolInput,
}: NativeToolCall): ToolOperation[] {
	const { cmd, file, text, questions } = toolInput as Record<string, string>;
	switch (toolName) {
		case "shell":
			return [{ kind: "command", tool: "Bash", command: cmd }];
		case "open":
			return [{ kind: "fileRead", tool: toolName, paths: [file] }];
		case "save":
			return [
				{ kind: "fileWrite", tool: toolName, path: file, contents: [text] },
			];
		case "ask":
			return [
				{
					kind: "question",
					tool: toolName,
					questionsJson: JSON.stringify({ questions }),
				},
			];
		default:
			return [];
	}
}
