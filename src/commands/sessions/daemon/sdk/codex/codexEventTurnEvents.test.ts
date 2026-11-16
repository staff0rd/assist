import type { ThreadItem } from "@openai/codex-sdk";
import { describe, expect, it, vi } from "vitest";
import { codexEventTurnEvents } from "./codexEventTurnEvents";

vi.mock("../../daemonLog", () => ({ daemonLog: vi.fn() }));

const activity = (item: ThreadItem) =>
	codexEventTurnEvents({ type: "item.started", item }, "session s");

describe("codexEventTurnEvents", () => {
	it.each<[ThreadItem, string]>([
		[
			{
				id: "1",
				type: "command_execution",
				command: "pnpm test",
				aggregated_output: "",
				status: "in_progress",
			},
			"Working · Shell",
		],
		[
			{
				id: "2",
				type: "file_change",
				changes: [{ path: "a.ts", kind: "update" }],
				status: "completed",
			},
			"Working · Edit",
		],
		[
			{
				id: "3",
				type: "mcp_tool_call",
				server: "github",
				tool: "search",
				arguments: {},
				status: "in_progress",
			},
			"Working · github.search",
		],
		[{ id: "4", type: "reasoning", text: "hmm" }, "Working · Reasoning"],
		[{ id: "5", type: "web_search", query: "q" }, "Working · Web search"],
		[{ id: "6", type: "agent_message", text: "done" }, "Working"],
	])("maps a started %s item to activity text", (item, text) => {
		expect(activity(item)).toEqual([{ kind: "activity", text }]);
	});

	it("maps updated items to activity text too", () => {
		expect(
			codexEventTurnEvents(
				{
					type: "item.updated",
					item: { id: "1", type: "reasoning", text: "more" },
				},
				"session s",
			),
		).toEqual([{ kind: "activity", text: "Working · Reasoning" }]);
	});

	it("reports the started thread as the session's conversation", () => {
		expect(
			codexEventTurnEvents(
				{ type: "thread.started", thread_id: "t" },
				"session s",
			),
		).toEqual([{ kind: "conversation", id: "t" }]);
	});

	it.each([
		{ type: "turn.started" } as const,
		{ type: "turn.failed", error: { message: "nope" } } as const,
		{ type: "error", message: "nope" } as const,
		{
			type: "item.completed",
			item: { id: "1", type: "agent_message", text: "hi" },
		} as const,
	])("emits no turn event for $type", (event) => {
		expect(codexEventTurnEvents(event, "session s")).toEqual([]);
	});
});
