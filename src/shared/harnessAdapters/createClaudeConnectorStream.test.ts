import { describe, expect, it } from "vitest";
import { createClaudeConnectorStream } from "./createClaudeConnectorStream";
import type { ConnectorRunEvent } from "./types";

function assistant(content: unknown[], id?: string, usage?: object): string {
	return JSON.stringify({ type: "assistant", message: { id, content, usage } });
}

function collect() {
	const events: ConnectorRunEvent[] = [];
	return { events, stream: createClaudeConnectorStream((e) => events.push(e)) };
}

describe("createClaudeConnectorStream", () => {
	it("normalizes tool calls to connector tools with readable labels", () => {
		const { events, stream } = collect();
		stream.onLine(
			assistant([
				{ type: "text", text: "Searching Gmail" },
				{
					type: "tool_use",
					id: "s1",
					name: "mcp__claude_ai_Gmail__search_threads",
					input: { query: "is:unread" },
				},
				{
					type: "tool_use",
					id: "r1",
					name: "mcp__claude_ai_Slack__slack_read_thread",
					input: { channel_id: "D1" },
				},
				{ type: "tool_use", id: "x1", name: "Bash", input: {} },
			]),
		);
		stream.onLine("not json");
		expect(events).toEqual([
			{ type: "text", text: "Searching Gmail", tokens: undefined },
			{
				type: "toolCall",
				callId: "s1",
				tool: "gmail.searchThreads",
				label: "Gmail search_threads",
				input: { query: "is:unread" },
				tokens: undefined,
			},
			{
				type: "toolCall",
				callId: "r1",
				tool: "slack.readThread",
				label: "Slack read_thread",
				input: { channel_id: "D1" },
				tokens: undefined,
			},
			{
				type: "toolCall",
				callId: "x1",
				tool: undefined,
				label: "Bash",
				input: {},
				tokens: undefined,
			},
		]);
	});

	it("flattens tool results to text", () => {
		const { events, stream } = collect();
		stream.onLine(
			JSON.stringify({
				type: "user",
				message: {
					content: [
						{
							type: "tool_result",
							tool_use_id: "s1",
							content: [{ type: "text", text: '{"threads":[]}' }],
						},
						{ type: "tool_result", tool_use_id: "s2", content: "limited" },
					],
				},
			}),
		);
		expect(events).toEqual([
			{ type: "toolResult", callId: "s1", text: '{"threads":[]}' },
			{ type: "toolResult", callId: "s2", text: "limited" },
		]);
	});

	it("reports the model from the system init line", () => {
		const { events, stream } = collect();
		stream.onLine(
			JSON.stringify({ type: "system", subtype: "init", model: "sonnet-x" }),
		);
		expect(events).toEqual([{ type: "model", model: "sonnet-x" }]);
	});

	it("counts each turn's usage once and attaches it to the turn's first event", () => {
		const { events, stream } = collect();
		const usage = {
			input_tokens: 10,
			output_tokens: 5,
			cache_read_input_tokens: 100,
			cache_creation_input_tokens: 20,
		};
		stream.onLine(
			assistant([{ type: "text", text: "Searching" }], "m1", usage),
		);
		stream.onLine(
			assistant([{ type: "tool_use", name: "x", input: {} }], "m1", usage),
		);
		stream.onLine(assistant([{ type: "text", text: "Done" }], "m2", usage));
		const progress = events.filter((e) => e.type !== "usage");
		expect(progress.map((e) => ("tokens" in e ? e.tokens : null))).toEqual([
			135,
			undefined,
			135,
		]);
		expect(events.filter((e) => e.type === "usage").at(-1)).toEqual({
			type: "usage",
			usage: {
				input: 20,
				output: 10,
				cacheRead: 200,
				cacheWrite: 40,
				costUsd: null,
				durationMs: null,
			},
		});
	});

	it("returns the structured output, cost and duration from the result line", () => {
		const { stream } = collect();
		stream.onLine(
			JSON.stringify({
				type: "result",
				is_error: false,
				total_cost_usd: 0.19,
				duration_ms: 44000,
				structured_output: { messages: [] },
			}),
		);
		const { output, usage } = stream.finish("claude exited 0");
		expect(output).toEqual({ messages: [] });
		expect(usage).toMatchObject({ costUsd: 0.19, durationMs: 44000 });
	});

	it("fails with the run's error result", () => {
		const { stream } = collect();
		stream.onLine(
			JSON.stringify({ type: "result", is_error: true, result: "boom" }),
		);
		expect(() => stream.finish("claude exited 1")).toThrow("boom");
	});

	it("fails with the exit reason when no result arrived", () => {
		const { stream } = collect();
		expect(() => stream.finish("claude exited 1: not logged in")).toThrow(
			"claude exited 1: not logged in",
		);
	});
});
