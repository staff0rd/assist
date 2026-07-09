import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { restartSession } from "./restartSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
	})),
}));

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
	})),
}));

const spawnClaudeMock = spawnClaude as unknown as ReturnType<typeof vi.fn>;
const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

function makeSession(overrides: Partial<Session>): Session {
	return {
		id: "1",
		name: "repo/session",
		commandType: "claude",
		status: "done",
		startedAt: 123,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "old output",
		restored: false,
		...overrides,
	};
}

describe("restartSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resumes a claude session by its conversation id", () => {
		const session = makeSession({
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "abc-123",
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.status).toBe("waiting");
		expect(session.scrollback).toBe("");
		expect(session.restored).toBeUndefined();
	});

	it("kills the running process group and defers resume until it exits", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
		const session = makeSession({
			commandType: "assist",
			status: "running",
			assistArgs: ["backlog", "run", "601"],
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
			pty: { kill: vi.fn(), pid: 4321 } as unknown as Session["pty"],
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(killSpy).toHaveBeenCalledWith(-4321, "SIGHUP");
		expect(spawnPtyMock).not.toHaveBeenCalled();
		expect(session.pendingRestart).toBeTypeOf("function");

		session.pendingRestart?.();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "601", "--resume-session", "abc-123"],
			"/home/user/repo",
			"1",
			undefined,
		);
		expect(session.status).toBe("running");
		killSpy.mockRestore();
	});

	it("does not restart a claude session without a conversation id or prompt", () => {
		const session = makeSession({
			claudeSessionId: undefined,
			initialPrompt: undefined,
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnClaudeMock).not.toHaveBeenCalled();
	});

	it("restarts a claude session fresh from its prompt when no conversation id is known", () => {
		const session = makeSession({
			claudeSessionId: undefined,
			initialPrompt: "do the thing",
			cwd: "/home/user/repo",
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			prompt: "do the thing",
			cwd: "/home/user/repo",
			sessionId: "1",
			claudeSessionId: expect.any(String),
		});
		expect(session.claudeSessionId).toEqual(expect.any(String));
		expect(session.status).toBe("running");
	});

	it("resumes a running assist session via the wrapper with --resume-session", () => {
		const session = makeSession({
			commandType: "assist",
			status: "running",
			assistArgs: ["backlog", "run", "601"],
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "601", "--resume-session", "abc-123"],
			"/home/user/repo",
			"1",
			undefined,
		);
		expect(session.status).toBe("running");
	});

	it("resumes an idle assist session as waiting with ASSIST_RESUME_IDLE", () => {
		const session = makeSession({
			commandType: "assist",
			status: "waiting",
			assistArgs: ["draft"],
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "draft", "--resume-session", "abc-123"],
			"/home/user/repo",
			"1",
			{ ASSIST_RESUME_IDLE: "1" },
		);
		expect(session.status).toBe("waiting");
	});

	it("restarts an assist session fresh when no conversation id is known", () => {
		const session = makeSession({
			commandType: "assist",
			status: "running",
			assistArgs: ["draft"],
			claudeSessionId: undefined,
			cwd: "/home/user/repo",
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "draft"],
			"/home/user/repo",
			"1",
			undefined,
		);
	});

	it("does not restart run sessions", () => {
		const run = makeSession({
			commandType: "run",
			runName: "build",
			claudeSessionId: "abc-123",
		});

		expect(restartSession(run, new Set(), vi.fn())).toBe(false);
		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});
});
