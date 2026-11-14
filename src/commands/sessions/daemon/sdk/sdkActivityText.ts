import { activityLine } from "./activityLine";

type ContentBlock = {
	type: string;
	name?: string;
	input?: unknown;
};

const TARGET_KEYS = [
	"command",
	"file_path",
	"notebook_path",
	"path",
	"pattern",
	"url",
	"query",
	"description",
	"skill",
];
function toolTarget(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const record = input as Record<string, unknown>;
	const key = TARGET_KEYS.find((k) => typeof record[k] === "string");
	if (!key) return "";
	return activityLine(record[key] as string);
}

export function sdkActivityText(content: readonly ContentBlock[]): string {
	const tool = [...content]
		.reverse()
		.find((block) => block.type === "tool_use");
	if (!tool?.name) return "Working";
	const target = toolTarget(tool.input);
	return `Working · ${tool.name}${target ? ` ${target}` : ""}`;
}
