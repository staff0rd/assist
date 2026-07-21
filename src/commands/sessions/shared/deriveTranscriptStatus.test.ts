import { describe, expect, it } from "vitest";
import { deriveTranscriptStatus } from "./deriveTranscriptStatus";

type Entry = Record<string, unknown>;

function userPrompt(text: string): Entry {
	return { type: "user", message: { role: "user", content: text } };
}

function userPromptBlocks(text: string): Entry {
	return {
		type: "user",
		message: { role: "user", content: [{ type: "text", text }] },
	};
}

function assistantText(text: string, stopReason = "end_turn"): Entry {
	return {
		type: "assistant",
		message: {
			role: "assistant",
			stop_reason: stopReason,
			content: [{ type: "text", text }],
		},
	};
}

function assistantToolUse(
	id: string,
	name: string,
	stopReason: string | null = "tool_use",
): Entry {
	return {
		type: "assistant",
		message: {
			role: "assistant",
			stop_reason: stopReason,
			content: [{ type: "tool_use", id, name, input: {} }],
		},
	};
}

function toolResult(toolUseId: string): Entry {
	return {
		type: "user",
		message: {
			role: "user",
			content: [{ type: "tool_result", tool_use_id: toolUseId, content: "ok" }],
		},
	};
}

function interruptForToolUse(): Entry {
	return {
		type: "user",
		message: {
			role: "user",
			content: [
				{ type: "text", text: "[Request interrupted by user for tool use]" },
			],
		},
	};
}

function interruptPlain(): Entry {
	return {
		type: "user",
		message: {
			role: "user",
			content: [{ type: "text", text: "[Request interrupted by user]" }],
		},
	};
}

describe("deriveTranscriptStatus", () => {
	it("returns null for an empty transcript", () => {
		expect(deriveTranscriptStatus([])).toBeNull();
	});

	it("returns null when only meta/sidechain entries are present", () => {
		expect(
			deriveTranscriptStatus([
				{
					type: "assistant",
					isMeta: true,
					message: { stop_reason: "tool_use" },
				},
				{ type: "user", isSidechain: true, message: { content: "hi" } },
				{ type: "file-history-snapshot" },
			]),
		).toBeNull();
	});

	it("derives waiting from an ended turn (end_turn)", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("hi"),
				assistantText("done", "end_turn"),
			]),
		).toBe("waiting");
	});

	it("derives waiting from a stop_sequence turn end", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("hi"),
				assistantText("done", "stop_sequence"),
			]),
		).toBe("waiting");
	});

	it("derives running while a tool_use is pending with no tool_result", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("run it"),
				assistantToolUse("toolu_1", "Bash"),
			]),
		).toBe("running");
	});

	it("derives running once a tool_use resolves mid-turn", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("run it"),
				assistantToolUse("toolu_1", "Bash"),
				toolResult("toolu_1"),
			]),
		).toBe("running");
	});

	it("derives waiting when a pending tool_use is AskUserQuestion", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("plan it"),
				assistantToolUse("toolu_q", "AskUserQuestion"),
			]),
		).toBe("waiting");
	});

	it("keeps AskUserQuestion waiting even without a permission hint", () => {
		expect(
			deriveTranscriptStatus(
				[userPrompt("plan it"), assistantToolUse("toolu_q", "AskUserQuestion")],
				{ permissionActive: false },
			),
		).toBe("waiting");
	});

	it("derives running for a pending non-AskUserQuestion tool without a permission hint", () => {
		expect(
			deriveTranscriptStatus(
				[userPrompt("run it"), assistantToolUse("toolu_1", "Bash")],
				{ permissionActive: false },
			),
		).toBe("running");
	});

	it("derives waiting for a pending tool when a permission block is active", () => {
		expect(
			deriveTranscriptStatus(
				[userPrompt("run it"), assistantToolUse("toolu_1", "Bash")],
				{ permissionActive: true },
			),
		).toBe("waiting");
	});

	it("ignores a permission hint once the tool_use has resolved", () => {
		expect(
			deriveTranscriptStatus(
				[
					userPrompt("run it"),
					assistantToolUse("toolu_1", "Bash"),
					toolResult("toolu_1"),
				],
				{ permissionActive: true },
			),
		).toBe("running");
	});

	it("derives running when a new user prompt follows an ended turn", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("first"),
				assistantText("answer", "end_turn"),
				userPrompt("second"),
			]),
		).toBe("running");
	});

	it("derives running for a fresh session whose only entry is a user prompt", () => {
		expect(deriveTranscriptStatus([userPrompt("do the thing")])).toBe(
			"running",
		);
	});

	it("treats a block-form user prompt as a new turn", () => {
		expect(
			deriveTranscriptStatus([
				assistantText("answer", "end_turn"),
				userPromptBlocks("keep going"),
			]),
		).toBe("running");
	});

	it("derives running when the final assistant message is still streaming (null stop_reason)", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("hi"),
				assistantText("partial", null as unknown as string),
			]),
		).toBe("running");
	});
});

describe("deriveTranscriptStatus — prior regression family", () => {
	it("#416: an ESC interrupt marker after a pending tool_use derives waiting", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("run it"),
				assistantToolUse("toolu_1", "Bash"),
				interruptForToolUse(),
			]),
		).toBe("waiting");
	});

	it("#416: a plain ESC interrupt marker derives waiting", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("write an essay"),
				assistantText("Once upon", "tool_use"),
				interruptPlain(),
			]),
		).toBe("waiting");
	});

	it("#485: AskUserQuestion waiting is derived without any hook", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("plan"),
				assistantToolUse("toolu_q", "AskUserQuestion"),
			]),
		).toBe("waiting");
	});

	it("#449/#509: an ended turn derives waiting regardless of dropped hooks", () => {
		expect(
			deriveTranscriptStatus([userPrompt("q"), assistantText("a", "end_turn")]),
		).toBe("waiting");
	});

	it("#680: a dropped `waiting` edge is healed because end_turn derives waiting", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("draft it"),
				assistantToolUse("toolu_1", "Write"),
				toolResult("toolu_1"),
				assistantText("all done", "end_turn"),
			]),
		).toBe("waiting");
	});

	it("#529: a resumed session's next prompt derives running without a UserPromptSubmit hook", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("earlier work"),
				assistantText("finished", "end_turn"),
				userPrompt("continue please"),
			]),
		).toBe("running");
	});

	it("#599: a silent mid-turn stall stays running (never flipped by any timeout)", () => {
		expect(
			deriveTranscriptStatus([
				userPrompt("long task"),
				assistantToolUse("toolu_1", "Bash"),
			]),
		).toBe("running");
	});
});
