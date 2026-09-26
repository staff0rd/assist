import { describe, expect, it } from "vitest";
import { unfinishedBackgroundTasks } from "./unfinishedBackgroundTasks";

function started(taskId: string): Record<string, unknown> {
	return {
		type: "user",
		message: { role: "user", content: [{ type: "tool_result" }] },
		toolUseResult: { stdout: "", backgroundTaskId: taskId },
	};
}

function notification(taskId: string, status = "completed") {
	return `<task-notification>\n<task-id>${taskId}</task-id>\n<status>${status}</status>\n</task-notification>`;
}

function queued(taskId: string, status?: string): Record<string, unknown> {
	return { type: "queue-operation", content: notification(taskId, status) };
}

function delivered(taskId: string, status?: string): Record<string, unknown> {
	return {
		type: "user",
		message: { role: "user", content: notification(taskId, status) },
	};
}

function stopCall(name: string, input: Record<string, string>) {
	return {
		type: "assistant",
		message: { content: [{ type: "tool_use", id: "t1", name, input }] },
	};
}

describe("unfinishedBackgroundTasks", () => {
	it("finds nothing in a transcript with no background work", () => {
		expect(unfinishedBackgroundTasks([{ type: "assistant" }])).toEqual([]);
	});

	it("reports a task that started and was never notified", () => {
		expect(unfinishedBackgroundTasks([started("bh1hjrdah")])).toEqual([
			"bh1hjrdah",
		]);
	});

	it("clears a task once its completion reaches the transcript", () => {
		expect(
			unfinishedBackgroundTasks([started("bh1hjrdah"), delivered("bh1hjrdah")]),
		).toEqual([]);
	});

	it("accepts the queue-operation form of the notification", () => {
		expect(
			unfinishedBackgroundTasks([started("bh1hjrdah"), queued("bh1hjrdah")]),
		).toEqual([]);
	});

	it("keeps the laps apart when a task restarts under a new id", () => {
		expect(
			unfinishedBackgroundTasks([
				started("lap1"),
				delivered("lap1"),
				started("lap2"),
			]),
		).toEqual(["lap2"]);
	});

	it("ignores a notification for a task whose start fell outside the tail", () => {
		expect(unfinishedBackgroundTasks([delivered("older")])).toEqual([]);
	});

	it("reports every task still in flight", () => {
		expect(
			unfinishedBackgroundTasks([
				started("one"),
				started("two"),
				delivered("one"),
				started("three"),
			]),
		).toEqual(["two", "three"]);
	});

	it.each(["killed", "stopped"])(
		"keeps a task whose queued notification says %s",
		(status) => {
			expect(
				unfinishedBackgroundTasks([started("b44"), queued("b44", status)]),
			).toEqual(["b44"]);
		},
	);

	it("keeps a task killed during teardown and reported again on resume", () => {
		expect(
			unfinishedBackgroundTasks([
				started("b44"),
				queued("b44", "killed"),
				delivered("b44", "killed"),
			]),
		).toEqual(["b44"]);
	});

	it.each([
		["TaskStop", { task_id: "b44" }],
		["KillShell", { shell_id: "b44" }],
	])("clears a task the agent stopped with %s", (name, input) => {
		expect(
			unfinishedBackgroundTasks([
				started("b44"),
				stopCall(name, input),
				delivered("b44", "killed"),
			]),
		).toEqual([]);
	});
});
