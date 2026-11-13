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
const MAX_TARGET = 80;

function toolTarget(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const record = input as Record<string, unknown>;
	const key = TARGET_KEYS.find((k) => typeof record[k] === "string");
	if (!key) return "";
	const line = (record[key] as string).split("\n")[0].trim();
	return line.length > MAX_TARGET ? `${line.slice(0, MAX_TARGET - 1)}…` : line;
}

export function sdkActivityText(content: readonly ContentBlock[]): string {
	const tool = [...content]
		.reverse()
		.find((block) => block.type === "tool_use");
	if (!tool?.name) return "Working";
	const target = toolTarget(tool.input);
	return `Working · ${tool.name}${target ? ` ${target}` : ""}`;
}
