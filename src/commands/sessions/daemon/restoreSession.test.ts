import { beforeEach, describe, expect, it, vi } from "vitest";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreSession } from "./restoreSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ fake: "pty" })),
}));

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: vi.fn(() => "/transcripts/found.jsonl"),
}));

vi.mock("./deriveRestoreStatus", () => ({
	deriveRestoreStatus: (p: PersistedSession) =>
		p.status === "running" ? "running" : "waiting",
}));

const spawnClaudeMock = spawnClaude as unknown as ReturnType<typeof vi.fn>;
const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;
const findTranscriptPathSyncMock =
	findTranscriptPathSync as unknown as ReturnType<typeof vi.fn>;

describe("restoreSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		findTranscriptPathSyncMock.mockReturnValue("/transcripts/found.jsonl");
	});

	it("respawns a claude session with a known sessionId via --resume", () => {
		const persisted: PersistedSession = {
			name: "repo/Fix the bug",
			commandType: "claude",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "abc-123",
			prompt:
				"A restart interrupted this conversation. Continue from where you left off.",
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.claudeSessionId).toBe("abc-123");
		expect(session.name).toBe("repo/Fix the bug");
	});

	it("relaunches a never-prompted claude session fresh with the same sessionId when no transcript exists", () => {
		findTranscriptPathSyncMock.mockReturnValue(null);
		const persisted: PersistedSession = {
			name: "repo/Fix the bug",
			commandType: "claude",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.restored).toBe(true);
		expect(session.claudeSessionId).toBe("abc-123");
	});

	it("relaunches a backlog run via the assist wrapper, resuming the latest phase's session", () => {
		const persisted: PersistedSession = {
			name: "repo/Run backlog 295",
			commandType: "assist",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
			assistArgs: ["backlog", "run", "295"],
			activity: {
				kind: "backlog",
				itemId: 295,
				itemName: "Fix the thing",
				phase: 2,
				totalPhases: 3,
				startedAt: 5,
			},
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "295", "--resume-session", "abc-123"],
			"/home/user/repo",
			"1",
			undefined,
		);
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.commandType).toBe("assist");
		expect(session.claudeSessionId).toBe("abc-123");
		expect(session.assistArgs).toEqual(["backlog", "run", "295"]);
		expect(session.activity).toEqual({
			kind: "backlog",
			itemId: 295,
			itemName: "Fix the thing",
			phase: 2,
			totalPhases: 3,
			startedAt: 5,
		});
	});

	it("relaunches a backlog run without a resume flag when no sessionId was discovered", () => {
		const persisted: PersistedSession = {
			name: "repo/Run backlog 295",
			commandType: "assist",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			assistArgs: ["backlog", "run", "295"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "295"],
			"/home/user/repo",
			"1",
			undefined,
		);
		expect(session.status).toBe("running");
		expect(session.claudeSessionId).toBeUndefined();
	});

	it("relaunches a --once draft session via the wrapper so the done signal is rewatched", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "draft-456",
			assistArgs: ["draft", "--once", "fix the thing"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(spawnPtyMock).toHaveBeenCalledWith(
			[
				"assist",
				"draft",
				"--once",
				"fix the thing",
				"--resume-session",
				"draft-456",
			],
			"/home/user/repo",
			"1",
			undefined,
		);
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.commandType).toBe("assist");
	});

	it("relaunches a --once refine session via the wrapper", () => {
		const persisted: PersistedSession = {
			name: "repo/assist refine 254",
			commandType: "assist",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "refine-789",
			assistArgs: ["refine", "254", "--once"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "refine", "254", "--once", "--resume-session", "refine-789"],
			"/home/user/repo",
			"1",
			undefined,
		);
		expect(session.status).toBe("running");
	});

	it("reopens an idle backlog run as waiting, signalling the wrapper to skip the nudge", () => {
		const persisted: PersistedSession = {
			name: "repo/Run backlog 295",
			commandType: "assist",
			status: "waiting",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
			assistArgs: ["backlog", "run", "295"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "295", "--resume-session", "abc-123"],
			"/home/user/repo",
			"1",
			{ ASSIST_RESUME_IDLE: "1" },
		);
		expect(session.status).toBe("waiting");
		expect(session.runningSince).toBeNull();
		expect(session.restored).toBe(true);
	});

	it("reopens an idle interactive claude session as waiting with no resume nudge", () => {
		const persisted: PersistedSession = {
			name: "repo/Fix the bug",
			commandType: "claude",
			status: "waiting",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "abc-123",
			prompt: undefined,
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.status).toBe("waiting");
		expect(session.runningSince).toBeNull();
	});

	it("restores a --once wrapper session with no recorded status as waiting, not nudged", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "draft-456",
			assistArgs: ["draft", "--once", "fix the thing"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			[
				"assist",
				"draft",
				"--once",
				"fix the thing",
				"--resume-session",
				"draft-456",
			],
			"/home/user/repo",
			"1",
			{ ASSIST_RESUME_IDLE: "1" },
		);
		expect(session.status).toBe("waiting");
		expect(session.runningSince).toBeNull();
	});

	it("restores an interactive claude session with no recorded status as waiting, not nudged", () => {
		const persisted: PersistedSession = {
			name: "repo/Fix the bug",
			commandType: "claude",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "abc-123",
			prompt: undefined,
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.status).toBe("waiting");
		expect(session.runningSince).toBeNull();
	});

	it("resumes a --once session via bare claude when no sessionId was discovered", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			assistArgs: ["draft", "--once"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnPtyMock).not.toHaveBeenCalled();
		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBe(false);
	});

	it("returns an error session for a claude session without a sessionId", () => {
		const persisted: PersistedSession = {
			name: "repo/Session 1",
			commandType: "claude",
			cwd: "/home/user/repo",
			startedAt: 123,
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("error");
		expect(session.restored).toBe(false);
		expect(session.pty).toBeNull();
		expect(session.error).toBeTruthy();
	});

	it("resumes an assist session with a discovered claude sessionId", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			status: "running",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "draft-456",
			assistArgs: ["draft"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "draft-456",
			prompt:
				"A restart interrupted this conversation. Continue from where you left off.",
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.commandType).toBe("assist");
		expect(session.assistArgs).toEqual(["draft"]);
	});

	it("returns a not-restored stub for an assist session, keeping retry args", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			assistArgs: ["draft"],
		};

		const session = restoreSession("3", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBe(false);
		expect(session.assistArgs).toEqual(["draft"]);
	});

	it("returns a cleanly completed card for a restored update session", () => {
		const persisted: PersistedSession = {
			name: "assist update",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			assistArgs: ["update"],
		};

		const session = restoreSession("4", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(spawnPtyMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBeUndefined();
		expect(session.pty).toBeNull();
		expect(session.startedAt).toBe(123);
	});

	it("returns a not-restored stub for a run session, keeping retry args", () => {
		const persisted: PersistedSession = {
			name: "repo/run: build",
			commandType: "run",
			cwd: "/home/user/repo",
			startedAt: 123,
			runName: "build",
			runArgs: ["--watch"],
		};

		const session = restoreSession("2", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBe(false);
		expect(session.runName).toBe("build");
		expect(session.runArgs).toEqual(["--watch"]);
		expect(session.startedAt).toBe(123);
	});
});
