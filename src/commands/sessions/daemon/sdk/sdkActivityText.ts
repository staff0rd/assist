import { activityLine } from "./activityLine";

type ContentBlock = {
	type: string;
	name?: string;
	input?: unknown;
};

const TARGET_KEYS = [
	"description",
	"command",
	"file_path",
	"notebook_path",
	"path",
	"pattern",
	"url",
	"query",
	"skill",
];

const LEADING_CD = /^cd\s+(?:"[^"]*"|'[^']*'|\S+)\s*(?:;|&&)\s*/;

function toolTarget(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const record = input as Record<string, unknown>;
	const key = TARGET_KEYS.find((k) => typeof record[k] === "string");
	if (!key) return "";
	const value = record[key] as string;
	return activityLine(
		key === "command" ? value.trim().replace(LEADING_CD, "") : value,
	);
}

export function sdkActivityText(content: readonly ContentBlock[]): string {
	const tool = [...content]
		.reverse()
		.find((block) => block.type === "tool_use");
	if (!tool?.name) return "Working";
	const target = toolTarget(tool.input);
	return `Working · ${tool.name}${target ? ` ${target}` : ""}`;
}
