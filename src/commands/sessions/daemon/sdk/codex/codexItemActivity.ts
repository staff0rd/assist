import type { ThreadItem } from "@openai/codex-sdk";
import { SDK_WORKING_ACTIVITY } from "../sdkActivityText";

const working = (detail: string) => `${SDK_WORKING_ACTIVITY} · ${detail}`;

export function codexItemActivity(item: ThreadItem): string {
	switch (item.type) {
		case "command_execution":
			return working("Shell");
		case "file_change":
			return working("Edit");
		case "mcp_tool_call":
			return working(`${item.server}.${item.tool}`);
		case "web_search":
			return working("Web search");
		case "reasoning":
			return working("Reasoning");
		default:
			return SDK_WORKING_ACTIVITY;
	}
}
