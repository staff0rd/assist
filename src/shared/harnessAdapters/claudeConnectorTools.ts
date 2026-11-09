import type { ConnectorTool } from "./types";

const gmail = (tool: string) => `mcp__claude_ai_Gmail__${tool}`;
const slack = (tool: string) => `mcp__claude_ai_Slack__${tool}`;

const nativeNames: Record<ConnectorTool, string> = {
	"gmail.searchThreads": gmail("search_threads"),
	"gmail.getThread": gmail("get_thread"),
	"slack.search": slack("slack_search_public_and_private"),
	"slack.readThread": slack("slack_read_thread"),
};

export const claudeConnectorTools = {
	native: (tool: ConnectorTool): string => nativeNames[tool],
	fromNative: (name: string): ConnectorTool | undefined =>
		(Object.keys(nativeNames) as ConnectorTool[]).find(
			(tool) => nativeNames[tool] === name,
		),
	label(name: string): string {
		const match = name.match(/^mcp__claude_ai_([^_]+)__(?:slack_)?(.+)$/);
		return match ? `${match[1]} ${match[2]}` : name;
	},
	denied: [
		...[
			"apply_sensitive_message_label",
			"apply_sensitive_thread_label",
			"create_draft",
			"create_label",
			"delete_draft",
			"delete_label",
			"forward",
			"label_message",
			"label_thread",
			"mark_message_spam",
			"mark_thread_spam",
			"reply",
			"send_message",
			"trash_message",
			"trash_thread",
			"unlabel_message",
			"unlabel_thread",
			"unmark_message_spam",
			"unmark_thread_spam",
			"untrash_message",
			"untrash_thread",
			"update_draft",
			"update_label",
			"update_message_labels",
		].map(gmail),
		...[
			"slack_add_reaction",
			"slack_create_canvas",
			"slack_create_conversation",
			"slack_schedule_message",
			"slack_send_message",
			"slack_send_message_draft",
			"slack_update_canvas",
		].map(slack),
	],
};
