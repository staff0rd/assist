import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, it } from "vitest";
import { sdkBackgroundTasks } from "./sdkBackgroundTasks";

const changed = (tasks: unknown[]) =>
	({
		type: "system",
		subtype: "background_tasks_changed",
		tasks,
		uuid: "u",
		session_id: "s",
	}) as unknown as SDKMessage;

describe("sdkBackgroundTasks", () => {
	it("lists live non-ambient task descriptions", () => {
		expect(
			sdkBackgroundTasks(
				changed([
					{ task_id: "a", task_type: "local_bash", description: "vite dev" },
					{
						task_id: "b",
						task_type: "monitor",
						description: "watch",
						ambient: true,
					},
				]),
			),
		).toEqual(["vite dev"]);
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
