import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { applySetStatus } from "./applySetStatus";
import type { Session, SessionStatus } from "./createSession";
import { watchPromptSubmit } from "./watchPromptSubmit";
import { SUBMIT_GRACE_MS } from "./watchSubmitOutcome";

vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTail: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const readMock = readTranscriptTail as unknown as ReturnType<typeof vi.fn>;

const ENTER = "\r";

function tail(uuid: string) {
	return [{ type: "assistant", uuid, message: { stop_reason: "end_turn" } }];
}

function restoredWaiting(): Session {
	return makeSession({
		status: "waiting",
		restored: true,
		transcriptPath: "/path/abc.jsonl",
		transcriptFingerprint: "last-turn",
	});
}

function applyingStatus() {
	return vi.fn((session: Session, status: SessionStatus) => {
		session.status = status;
	});
}

describe("watchSubmitOutcome", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
	});
	afterEach(() => vi.useRealTimers());

	it("reverts a restored session to waiting when an empty Enter starts no turn", async () => {
		readMock.mockResolvedValue(tail("last-turn"));
		const session = restoredWaiting();
		const onStatusChange = applyingStatus();

		watchPromptSubmit(session, ENTER, onStatusChange);
		expect(session.status).toBe("running");

		await vi.advanceTimersByTimeAsync(SUBMIT_GRACE_MS);

		expect(onStatusChange).toHaveBeenLastCalledWith(session, "waiting");
		expect(session.status).toBe("waiting");
		expect(session.pendingSubmit).toBeUndefined();
	});

	it("keeps a real prompt running once the transcript records the turn", async () => {
		readMock.mockResolvedValue(tail("new-prompt"));
		const session = restoredWaiting();
		const onStatusChange = applyingStatus();

		watchPromptSubmit(session, `hello${ENTER}`, onStatusChange);
		await vi.advanceTimersByTimeAsync(SUBMIT_GRACE_MS);

		expect(onStatusChange).toHaveBeenCalledTimes(1);
		expect(session.status).toBe("running");
	});

	it("does not revert once a hook reports the session's status", async () => {
		readMock.mockResolvedValue(tail("last-turn"));
		const session = restoredWaiting();
		const onStatusChange = applyingStatus();
		const sessions = new Map([[session.id, session]]);

		watchPromptSubmit(session, ENTER, onStatusChange);
		applySetStatus(sessions, session.id, "running", "pretool", onStatusChange);
		await vi.advanceTimersByTimeAsync(SUBMIT_GRACE_MS);

		expect(readMock).not.toHaveBeenCalled();
		expect(session.status).toBe("running");
	});

	it("leaves a session that already left running alone", async () => {
		readMock.mockResolvedValue(tail("last-turn"));
		const session = restoredWaiting();
		const onStatusChange = applyingStatus();

		watchPromptSubmit(session, ENTER, onStatusChange);
		session.status = "done";
		await vi.advanceTimersByTimeAsync(SUBMIT_GRACE_MS);

		expect(onStatusChange).toHaveBeenCalledTimes(1);
		expect(session.status).toBe("done");
	});
});
