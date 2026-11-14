import { activityLine } from "./activityLine";
import { commandActivityLine } from "./commandActivityLine";

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

function toolTarget(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const record = input as Record<string, unknown>;
	const key = TARGET_KEYS.find((k) => typeof record[k] === "string");
	if (!key) return "";
	const value = record[key] as string;
	return key === "command" ? commandActivityLine(value) : activityLine(value);
}

export const SDK_WORKING_ACTIVITY = "Working";

export function sdkActivityText(content: readonly ContentBlock[]): string {
	const tool = [...content]
		.reverse()
		.find((block) => block.type === "tool_use");
	if (!tool?.name) return SDK_WORKING_ACTIVITY;
	const target = toolTarget(tool.input);
	return `${SDK_WORKING_ACTIVITY} · ${tool.name}${target ? ` ${target}` : ""}`;
}
