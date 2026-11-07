import { beforeEach, describe, expect, it, vi } from "vitest";
import { deriveRestoreStatus } from "./deriveRestoreStatus";
import type { PersistedSession } from "./loadPersistedSessions";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { findCodexRolloutPathSync } from "../shared/codex/findCodexRolloutPathSync";

vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: vi.fn(),
}));

vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTailSync: vi.fn(),
}));

vi.mock("../shared/codex/findCodexRolloutPathSync", () => ({
	findCodexRolloutPathSync: vi.fn(),
}));

const findMock = findTranscriptPathSync as unknown as ReturnType<typeof vi.fn>;
const findRolloutMock = findCodexRolloutPathSync as unknown as ReturnType<
	typeof vi.fn
>;
const readMock = readTranscriptTailSync as unknown as ReturnType<typeof vi.fn>;

function persisted(
	overrides: Partial<PersistedSession> = {},
): PersistedSession {
	return {
		name: "repo/Task",
		commandType: "claude",
		cwd: "/home/me/repo",
		startedAt: 1,
		claudeSessionId: "abc-123",
		...overrides,
	};
}

function endTurn() {
	return [
		{ type: "user", message: { content: "hi" } },
		{
			type: "assistant",
			message: {
				stop_reason: "end_turn",
				content: [{ type: "text", text: "done" }],
			},
		},
	];
}

function midTurn() {
	return [
		{ type: "user", message: { content: "run it" } },
		{
			type: "assistant",
			message: {
				stop_reason: "tool_use",
				content: [{ type: "tool_use", id: "t1", name: "Bash", input: {} }],
			},
		},
	];
}

describe("deriveRestoreStatus", () => {
	it("reopens waiting when there is no recorded claude session id", () => {
		expect(deriveRestoreStatus(persisted({ claudeSessionId: undefined }))).toBe(
			"waiting",
		);
	});

	it("reopens waiting when no transcript file can be located", () => {
		findMock.mockReturnValue(null);
		expect(deriveRestoreStatus(persisted())).toBe("waiting");
	});

	it("reopens waiting for an idle transcript (ended turn), ignoring persisted running", () => {
		findMock.mockReturnValue("/path/abc-123.jsonl");
		readMock.mockReturnValue(endTurn());
		expect(deriveRestoreStatus(persisted({ status: "running" }))).toBe(
			"waiting",
		);
	});

	it("reopens running for a mid-turn transcript, ignoring persisted waiting", () => {
		findMock.mockReturnValue("/path/abc-123.jsonl");
		readMock.mockReturnValue(midTurn());
		expect(deriveRestoreStatus(persisted({ status: "waiting" }))).toBe(
			"running",
		);
	});

	it("reopens asking when the last turn left an AskUserQuestion unanswered", () => {
		findMock.mockReturnValue("/path/abc-123.jsonl");
		readMock.mockReturnValue([
			{ type: "user", message: { content: "draft it" } },
			{
				type: "assistant",
				message: {
					stop_reason: "tool_use",
					content: [
						{ type: "tool_use", id: "q1", name: "AskUserQuestion", input: {} },
					],
				},
			},
		]);
		expect(deriveRestoreStatus(persisted())).toBe("asking");
	});

	it("converges from a transcript even when persisted status is absent (first restart after deploy)", () => {
		findMock.mockReturnValue("/path/abc-123.jsonl");
		readMock.mockReturnValue(midTurn());
		expect(deriveRestoreStatus(persisted({ status: undefined }))).toBe(
			"running",
		);
	});
});

function codex(overrides: Partial<PersistedSession> = {}): PersistedSession {
	return persisted({
		harness: "codex",
		claudeSessionId: undefined,
		harnessSessionId: "codex-conv",
		...overrides,
	});
}

const event = (type: string) => ({ type: "event_msg", payload: { type } });
const toolCall = { type: "response_item", payload: { type: "function_call" } };

describe("deriveRestoreStatus for codex sessions", () => {
	beforeEach(() => vi.clearAllMocks());

	it("reopens running when the rollout's last turn started and never ended", () => {
		findRolloutMock.mockReturnValue("/codex/rollout-x-codex-conv.jsonl");
		readMock.mockReturnValue([
			event("task_started"),
			toolCall,
			event("token_count"),
		]);
		expect(deriveRestoreStatus(codex({ status: "waiting" }))).toBe("running");
		expect(findRolloutMock).toHaveBeenCalledWith("codex-conv");
		expect(findMock).not.toHaveBeenCalled();
	});

	it("reopens waiting when the rollout's last turn completed", () => {
		findRolloutMock.mockReturnValue("/codex/rollout-x-codex-conv.jsonl");
		readMock.mockReturnValue([
			event("task_started"),
			toolCall,
			event("task_complete"),
		]);
		expect(deriveRestoreStatus(codex({ status: "running" }))).toBe("waiting");
	});

	it("reopens waiting when the rollout's last turn was aborted", () => {
		findRolloutMock.mockReturnValue("/codex/rollout-x-codex-conv.jsonl");
		readMock.mockReturnValue([event("task_started"), event("turn_aborted")]);
		expect(deriveRestoreStatus(codex())).toBe("waiting");
	});

	it("reopens running when the tail holds agent activity but no turn boundary", () => {
		findRolloutMock.mockReturnValue("/codex/rollout-x-codex-conv.jsonl");
		readMock.mockReturnValue([toolCall, event("token_count")]);
		expect(deriveRestoreStatus(codex())).toBe("running");
	});

	it("reopens waiting for a rollout with no agent activity yet", () => {
		findRolloutMock.mockReturnValue("/codex/rollout-x-codex-conv.jsonl");
		readMock.mockReturnValue([{ type: "session_meta", payload: {} }]);
		expect(deriveRestoreStatus(codex())).toBe("waiting");
	});

	it("reopens waiting when no rollout can be located", () => {
		findRolloutMock.mockReturnValue(null);
		expect(deriveRestoreStatus(codex())).toBe("waiting");
	});

	it("reopens waiting when no codex session id is bound", () => {
		expect(deriveRestoreStatus(codex({ harnessSessionId: undefined }))).toBe(
			"waiting",
		);
		expect(findRolloutMock).not.toHaveBeenCalled();
	});
});
