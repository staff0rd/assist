import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, it } from "vitest";
import { createSdkBackgroundTasks } from "./createSdkBackgroundTasks";

const changed = (tasks: unknown[]) =>
	({
		type: "system",
		subtype: "background_tasks_changed",
		tasks,
		uuid: "u",
		session_id: "s",
	}) as unknown as SDKMessage;

const sdkBackgroundTasks = createSdkBackgroundTasks();

describe("sdkBackgroundTasks", () => {
	it("labels live non-ambient tasks by tool name, not command", () => {
		expect(
			sdkBackgroundTasks(
				changed([
					{ task_id: "a", task_type: "local_bash", description: "vite dev" },
					{ task_id: "b", task_type: "local_agent", description: "Explore" },
					{
						task_id: "c",
						task_type: "monitor",
						description: "watch",
						ambient: true,
					},
				]),
			),
		).toEqual(["Bash", "Agent"]);
	});

	it("falls back to the task type for an unmapped task", () => {
		expect(
			sdkBackgroundTasks(
				changed([{ task_id: "a", task_type: "mcp_task", description: "x" }]),
			),
		).toEqual(["mcp_task"]);
	});

	it("returns an empty set when every task ended", () => {
		expect(sdkBackgroundTasks(changed([]))).toEqual([]);
	});

	it("ignores other messages", () => {
		expect(
			sdkBackgroundTasks({ type: "system", subtype: "init" } as SDKMessage),
		).toBeUndefined();
	});
});
