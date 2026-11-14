import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { beforeEach, describe, expect, it } from "vitest";
import { createSdkBackgroundTasks } from "./createSdkBackgroundTasks";

const changed = (tasks: unknown[]) =>
	({
		type: "system",
		subtype: "background_tasks_changed",
		tasks,
		uuid: "u",
		session_id: "s",
	}) as unknown as SDKMessage;

const bashCall = (command: string, description: string) =>
	({
		type: "assistant",
		parent_tool_use_id: null,
		message: {
			content: [
				{ type: "tool_use", name: "Bash", input: { command, description } },
			],
		},
	}) as unknown as SDKMessage;

let sdkBackgroundTasks: ReturnType<typeof createSdkBackgroundTasks>;
beforeEach(() => {
	sdkBackgroundTasks = createSdkBackgroundTasks();
});

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

	it("shows only the first line of a multi-line command, capped", () => {
		const command = `cd /repo; cat > /tmp/q.json <<'JSON'\n{"questions":[]}\nJSON\nassist ask-question`;
		expect(
			sdkBackgroundTasks(
				changed([
					{ task_id: "a", task_type: "local_bash", description: command },
					{
						task_id: "b",
						task_type: "local_bash",
						description: `vite ${"x".repeat(100)}`,
					},
				]),
			),
		).toEqual(["cat > /tmp/q.json <<'JSON'", `vite ${"x".repeat(74)}…`]);
	});

	it("labels a shell task with the description of the Bash call that started it", () => {
		const command = "cd /repo && assist ask-check --json - < /tmp/c.json\n";
		expect(
			sdkBackgroundTasks(bashCall(command, "Raise manual check")),
		).toBeUndefined();
		expect(
			sdkBackgroundTasks(
				changed([
					{
						task_id: "a",
						task_type: "local_bash",
						description: command.trim(),
					},
				]),
			),
		).toEqual(["Raise manual check"]);
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
