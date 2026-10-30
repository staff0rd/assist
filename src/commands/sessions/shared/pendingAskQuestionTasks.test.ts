import { describe, expect, it } from "vitest";
import { awaitsQuestionAnswer } from "./awaitsQuestionAnswer";
import { pendingAskQuestionTasks } from "./pendingAskQuestionTasks";

function launched(toolUseId: string, command: string, taskId: string) {
	return [
		{
			type: "assistant",
			message: {
				stop_reason: "tool_use",
				content: [
					{
						type: "tool_use",
						id: toolUseId,
						name: "Bash",
						input: { command, run_in_background: true },
					},
				],
			},
		},
		{
			type: "user",
			message: {
				role: "user",
				content: [{ type: "tool_result", tool_use_id: toolUseId }],
			},
			toolUseResult: { stdout: "", backgroundTaskId: taskId },
		},
		{
			type: "assistant",
			message: {
				stop_reason: "end_turn",
				content: [{ type: "text", text: "Waiting for your answer." }],
			},
		},
	];
}

function finished(taskId: string) {
	return {
		type: "user",
		message: {
			role: "user",
			content: `<task-notification>\n<task-id>${taskId}</task-id>\n<status>completed</status>\n</task-notification>`,
		},
	};
}

const ASK = "assist ask-question --json - < /tmp/q.json";

describe("pendingAskQuestionTasks", () => {
	it("finds an assist ask-question background task still running", () => {
		expect(pendingAskQuestionTasks(launched("t1", ASK, "bq1"))).toEqual([
			"bq1",
		]);
	});

	it("ignores other background tasks", () => {
		expect(
			pendingAskQuestionTasks(launched("t1", "npm run dev", "bd1")),
		).toEqual([]);
	});

	it("drops the task once it has finished", () => {
		expect(
			pendingAskQuestionTasks([...launched("t1", ASK, "bq1"), finished("bq1")]),
		).toEqual([]);
	});
});

describe("awaitsQuestionAnswer", () => {
	it("recognises a pending assist ask-question as a waiting question", () => {
		expect(awaitsQuestionAnswer(launched("t1", ASK, "bq1"))).toBe(true);
	});

	it("is not waiting on a question for an unrelated background task", () => {
		expect(awaitsQuestionAnswer(launched("t1", "npm run dev", "bd1"))).toBe(
			false,
		);
	});
});
