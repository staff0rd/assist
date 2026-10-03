import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import type * as makePtyModule from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import { restartSession } from "./restartSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnClaude", async () => {
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../test/mothers/makePty",
	);
	return { spawnClaude: vi.fn(() => makePty().pty) };
});

vi.mock("./spawnPty", async () => {
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../test/mothers/makePty",
	);
	return { spawnPty: vi.fn(() => makePty().pty) };
});

const spawnClaudeMock = spawnClaude as unknown as ReturnType<typeof vi.fn>;
const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

describe("restartSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resumes a claude session by its conversation id", () => {
		const session = makeSession({
			id: "1",
			commandType: "claude",
			status: "done",
			scrollback: "old output",
			restored: false,
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
			id: "1",
			commandType: "assist",
			status: "running",
			assistArgs: ["backlog", "run", "601"],
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
			pty: makePty(4321).pty,
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

	it("restarts an errored session directly without killing its dead pty", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
		const { pty } = makePty(4321);
		const session = makeSession({
			id: "1",
			commandType: "claude",
			status: "error",
			claudeSessionId: "abc-123",
			cwd: "/home/user/repo",
			pty,
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(killSpy).not.toHaveBeenCalled();
		expect(pty.kill).not.toHaveBeenCalled();
		expect(session.pendingRestart).toBeUndefined();
		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "abc-123",
			cwd: "/home/user/repo",
			sessionId: "1",
		});
		expect(session.status).toBe("waiting");
		killSpy.mockRestore();
	});

	it("does not restart a claude session without a conversation id or prompt", () => {
		const session = makeSession({
			id: "1",
			commandType: "claude",
			status: "done",
			claudeSessionId: undefined,
			initialPrompt: undefined,
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnClaudeMock).not.toHaveBeenCalled();
	});

	it("opens a fresh agent in the workspace of a recovered card with no conversation", () => {
		const session = makeSession({
			id: "1",
			commandType: "claude",
			status: "stopped",
			claudeSessionId: undefined,
			initialPrompt: undefined,
			cwd: "/home/user/repo-2",
			worktree: { path: "/home/user/repo-2", clone: "/home/user/repo" },
			undurable: { reason: "uncommitted changes", removesTree: true },
		});

		expect(restartSession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			prompt: undefined,
			cwd: "/home/user/repo-2",
			sessionId: "1",
			claudeSessionId: expect.any(String),
		});
		expect(session.status).toBe("waiting");
		expect(session.undurable).toBeUndefined();
	});

	it("restarts a claude session fresh from its prompt when no conversation id is known", () => {
		const session = makeSession({
			id: "1",
			commandType: "claude",
			status: "done",
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
			id: "1",
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
			id: "1",
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
			id: "1",
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
			id: "1",
			status: "done",
			commandType: "run",
			runName: "build",
			claudeSessionId: "abc-123",
		});

		expect(restartSession(run, new Set(), vi.fn())).toBe(false);
		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});
});
