import { describe, expect, it, vi } from "vitest";
import { deriveRestoreStatus } from "./deriveRestoreStatus";
import type { PersistedSession } from "./loadPersistedSessions";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";

vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: vi.fn(),
}));

vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTailSync: vi.fn(),
}));

const findMock = findTranscriptPathSync as unknown as ReturnType<typeof vi.fn>;
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

	it("converges from a transcript even when persisted status is absent (first restart after deploy)", () => {
		findMock.mockReturnValue("/path/abc-123.jsonl");
		readMock.mockReturnValue(midTurn());
		expect(deriveRestoreStatus(persisted({ status: undefined }))).toBe(
			"running",
		);
	});
});
