import { describe, expect, it } from "vitest";
import { createInboxScanParser } from "./createInboxScanParser";
import type { InboxScanEvent } from "./InboxScanEvent";

function assistant(content: unknown[]): string {
	return JSON.stringify({ type: "assistant", message: { content } });
}

describe("createInboxScanParser", () => {
	it("emits tool calls with key args and assistant text", () => {
		const events: InboxScanEvent[] = [];
		const parser = createInboxScanParser((e) => events.push(e));
		parser.onLine(
			assistant([
				{ type: "text", text: "Searching Gmail" },
				{
					type: "tool_use",
					name: "mcp__claude_ai_Gmail__search_threads",
					input: { query: "is:unread" },
				},
				{
					type: "tool_use",
					name: "mcp__claude_ai_Slack__slack_read_thread",
					input: { channel_id: "D1", message_ts: "1.2" },
				},
			]),
		);
		parser.onLine("not json");
		expect(
			events.map(({ kind, label, detail }) => [kind, label, detail]),
		).toEqual([
			["text", "Assistant", "Searching Gmail"],
			["tool", "Gmail search_threads", "is:unread"],
			["tool", "Slack read_thread", "D1 1.2"],
		]);
	});

	it("returns the structured output from the result event", () => {
		const parser = createInboxScanParser(() => {});
		parser.onLine(
			JSON.stringify({
				type: "result",
				is_error: false,
				structured_output: { messages: [] },
			}),
		);
		expect(parser.finish("claude exited 0")).toEqual([]);
	});

	it("fails with the exit reason when no result arrived", () => {
		const parser = createInboxScanParser(() => {});
		expect(() => parser.finish("claude exited 1: not logged in")).toThrow(
			"Inbox scan failed: claude exited 1: not logged in",
		);
	});
});
