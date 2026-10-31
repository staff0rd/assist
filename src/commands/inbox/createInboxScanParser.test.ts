import { describe, expect, it } from "vitest";
import { createInboxScanParser } from "./createInboxScanParser";
import type { InboxScanEvent, InboxScanUsage } from "./InboxScanEvent";

function assistant(content: unknown[]): string {
	return JSON.stringify({ type: "assistant", message: { content } });
}

describe("createInboxScanParser", () => {
	it("emits tool calls with key args and assistant text", () => {
		const events: InboxScanEvent[] = [];
		const parser = createInboxScanParser({ onEvent: (e) => events.push(e) });
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

	it("counts each turn's usage once and attaches it to the turn's first row", () => {
		const events: InboxScanEvent[] = [];
		const usages: InboxScanUsage[] = [];
		const parser = createInboxScanParser({
			onEvent: (e) => events.push(e),
			onUsage: (u) => usages.push(u),
		});
		const usage = {
			input_tokens: 10,
			output_tokens: 5,
			cache_read_input_tokens: 100,
			cache_creation_input_tokens: 20,
		};
		const line = (id: string, content: unknown[]) =>
			JSON.stringify({
				type: "assistant",
				message: { id, content, usage },
			});
		parser.onLine(line("m1", [{ type: "text", text: "Searching" }]));
		parser.onLine(
			line("m1", [{ type: "tool_use", name: "x", input: { query: "q" } }]),
		);
		parser.onLine(line("m2", [{ type: "text", text: "Done" }]));
		expect(events.map((e) => e.tokens)).toEqual([135, undefined, 135]);
		expect(usages.at(-1)).toEqual({
			input: 20,
			output: 10,
			cacheRead: 200,
			cacheWrite: 40,
			costUsd: null,
			durationMs: null,
		});
	});

	it("returns the structured output, cost and duration from the result event", () => {
		const parser = createInboxScanParser();
		parser.onLine(
			JSON.stringify({
				type: "result",
				is_error: false,
				total_cost_usd: 0.19,
				duration_ms: 44000,
				structured_output: { messages: [] },
			}),
		);
		const { messages, usage } = parser.finish("claude exited 0");
		expect(messages).toEqual([]);
		expect(usage).toMatchObject({ costUsd: 0.19, durationMs: 44000 });
	});

	it("fails with the exit reason when no result arrived", () => {
		const parser = createInboxScanParser();
		expect(() => parser.finish("claude exited 1: not logged in")).toThrow(
			"Inbox scan failed: claude exited 1: not logged in",
		);
	});
});
