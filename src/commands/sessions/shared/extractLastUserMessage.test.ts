import { describe, expect, it } from "vitest";
import { extractLastUserMessage } from "./extractLastUserMessage";

function user(
	content: unknown,
	overrides: Record<string, unknown> = {},
): Record<string, unknown> {
	return { type: "user", message: { role: "user", content }, ...overrides };
}

function assistant(text: string): Record<string, unknown> {
	return {
		type: "assistant",
		message: { stop_reason: "end_turn", content: [{ type: "text", text }] },
	};
}

function toolResult(id: string): Record<string, unknown> {
	return user([{ type: "tool_result", tool_use_id: id, content: "ok" }]);
}

describe("extractLastUserMessage", () => {
	it("returns nothing for a transcript with no user prompt", () => {
		expect(extractLastUserMessage([assistant("hello")])).toBeUndefined();
	});

	it("returns the newest plain prompt", () => {
		const entries = [user("first"), assistant("ok"), user("second")];

		expect(extractLastUserMessage(entries)).toBe("second");
	});

	it("reads a prompt from text content blocks", () => {
		const entries = [user([{ type: "text", text: "  block prompt  " }])];

		expect(extractLastUserMessage(entries)).toBe("block prompt");
	});

	it("renders a bare slash command as its name", () => {
		const entries = [
			user(
				"<command-message>verify</command-message>\n<command-name>/verify</command-name>\n<command-args></command-args>",
			),
		];

		expect(extractLastUserMessage(entries)).toBe("/verify");
	});

	it("renders a slash command with its arguments", () => {
		const entries = [
			user(
				"<command-message>draft</command-message>\n<command-name>/draft</command-name>\n<command-args>can we detect stalls</command-args>",
			),
		];

		expect(extractLastUserMessage(entries)).toBe("/draft can we detect stalls");
	});

	it("skips past an interrupt marker to the prompt before it", () => {
		const entries = [
			user("do the thing"),
			assistant("working"),
			user("[Request interrupted by user for tool use]"),
		];

		expect(extractLastUserMessage(entries)).toBe("do the thing");
	});

	it("skips an interrupt that arrives as a text block", () => {
		const entries = [
			user("do the thing"),
			user([{ type: "text", text: "[Request interrupted by user]" }]),
		];

		expect(extractLastUserMessage(entries)).toBe("do the thing");
	});

	it("skips a tail made only of tool results", () => {
		const entries = [
			user("run the build"),
			assistant("running"),
			toolResult("t1"),
			toolResult("t2"),
		];

		expect(extractLastUserMessage(entries)).toBe("run the build");
	});

	it("returns nothing when the tail holds only tool results", () => {
		expect(extractLastUserMessage([toolResult("t1")])).toBeUndefined();
	});

	it("ignores isMeta and isSidechain entries", () => {
		const entries = [
			user("real prompt"),
			user("meta prompt", { isMeta: true }),
			user("sidechain prompt", { isSidechain: true }),
		];

		expect(extractLastUserMessage(entries)).toBe("real prompt");
	});

	it("skips a task notification that follows the user's prompt", () => {
		const entries = [
			user("/bug the panel is wrong"),
			assistant("filing"),
			user(
				"<task-notification>\n<task-id>b1</task-id>\n<status>completed</status>\n<summary>done</summary>\n</task-notification>",
				{
					origin: { kind: "task-notification" },
					promptSource: "system",
					turnOrigin: "task_notification",
				},
			),
		];

		expect(extractLastUserMessage(entries)).toBe("/bug the panel is wrong");
	});

	it("skips a task notification that carries no origin", () => {
		const entries = [
			user("earlier prompt"),
			user(
				"<task-notification>\n<task-id>b1</task-id>\n<status>completed</status>\n</task-notification>",
			),
		];

		expect(extractLastUserMessage(entries)).toBe("earlier prompt");
	});

	it("strips system-reminder blocks from the prompt", () => {
		const entries = [
			user(
				"check the logs\n<system-reminder>Codebase instructions follow</system-reminder>",
			),
		];

		expect(extractLastUserMessage(entries)).toBe("check the logs");
	});

	it("skips an entry that is nothing but a system reminder", () => {
		const entries = [
			user("earlier prompt"),
			user("<system-reminder>context refreshed</system-reminder>"),
		];

		expect(extractLastUserMessage(entries)).toBe("earlier prompt");
	});

	it("caps a long prompt and marks it as truncated", () => {
		const entries = [user("x".repeat(50))];

		expect(extractLastUserMessage(entries, 10)).toBe("xxxxxxxxxx…");
	});

	it("leaves a prompt at the cap untouched", () => {
		const entries = [user("0123456789")];

		expect(extractLastUserMessage(entries, 10)).toBe("0123456789");
	});
});
