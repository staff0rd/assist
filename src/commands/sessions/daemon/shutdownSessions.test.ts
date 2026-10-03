import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { persistLiveSessions } from "./loadPersistedSessions";
import { shutdownSessions } from "./shutdownSessions";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./loadPersistedSessions", () => ({ persistLiveSessions: vi.fn() }));

const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const persistMock = persistLiveSessions as unknown as ReturnType<typeof vi.fn>;

function loggedLines(): string[] {
	return logMock.mock.calls.map((call) => String(call[0]));
}

function sessionMap(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((session) => [session.id, session]));
}

describe("shutdownSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("kills every live pty", () => {
		const first = makePty().pty;
		const second = makePty().pty;

		shutdownSessions(
			sessionMap(
				makeSession({ id: "1", status: "running", pty: first }),
				makeSession({ id: "2", status: "running", pty: second }),
			),
		);

		expect(first.kill).toHaveBeenCalledOnce();
		expect(second.kill).toHaveBeenCalledOnce();
	});

	it("skips sessions that are already done", () => {
		const { pty } = makePty();

		shutdownSessions(sessionMap(makeSession({ status: "done", pty })));

		expect(pty.kill).not.toHaveBeenCalled();
	});

	it("names every session it kills so the loss is traceable", () => {
		shutdownSessions(
			sessionMap(
				makeSession({ id: "1", name: "Session 1", status: "running" }),
				makeSession({ id: "2", name: "Session 2", status: "running" }),
				makeSession({ id: "3", name: "Session 3", status: "done" }),
			),
		);

		expect(loggedLines()).toContainEqual(
			"shutting down: killing 2 session(s): Session 1 (1), Session 2 (2)",
		);
	});

	it("records the daemon restart against each killed session", () => {
		const sessions = sessionMap(
			makeSession({ id: "1", status: "running" }),
			makeSession({ id: "2", status: "done" }),
		);

		shutdownSessions(sessions);

		expect(sessions.get("1")?.interrupted).toEqual({
			reason: "daemon-restart",
			at: expect.any(Number),
		});
		expect(sessions.get("2")?.interrupted).toBeUndefined();
	});

	it("persists the recorded reason before the ptys die", () => {
		const { pty } = makePty();
		pty.kill.mockImplementation(() => {
			expect(persistMock).toHaveBeenCalledOnce();
		});

		shutdownSessions(sessionMap(makeSession({ status: "running", pty })));

		expect(pty.kill).toHaveBeenCalledOnce();
	});

	it("still kills the ptys when the reason cannot be persisted", () => {
		persistMock.mockImplementationOnce(() => {
			throw new Error("EACCES");
		});
		const { pty } = makePty();

		shutdownSessions(sessionMap(makeSession({ status: "running", pty })));

		expect(pty.kill).toHaveBeenCalledOnce();
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("could not record the restart"),
		);
	});

	it("tears down the remaining sessions when a kill throws", () => {
		const thrower = makePty().pty;
		const survivor = makePty().pty;
		thrower.kill.mockImplementation(() => {
			throw new Error("AttachConsole failed");
		});

		shutdownSessions(
			sessionMap(
				makeSession({
					id: "1",
					name: "Session 1",
					status: "running",
					pty: thrower,
				}),
				makeSession({ id: "2", status: "running", pty: survivor }),
			),
		);

		expect(survivor.kill).toHaveBeenCalledOnce();
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("Session 1 (1) failed: AttachConsole failed"),
		);
		expect(loggedLines()).toContainEqual(
			expect.stringContaining("1 session(s) failed to die"),
		);
	});

	it("does not throw out of the shutdown loop", () => {
		const { pty } = makePty();
		pty.kill.mockImplementation(() => {
			throw new Error("AttachConsole failed");
		});

		expect(() =>
			shutdownSessions(sessionMap(makeSession({ status: "running", pty }))),
		).not.toThrow();
	});
});
