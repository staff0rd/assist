import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { wirePtyEvents } from "./wirePtyEvents";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

type ExitHandler = (e: { exitCode: number }) => void;

function fakePty() {
	let onExit: ExitHandler = () => {};
	let onData: (data: string) => void = () => {};
	return {
		pty: {
			onData: vi.fn((cb: (data: string) => void) => {
				onData = cb;
			}),
			onExit: vi.fn((cb: ExitHandler) => {
				onExit = cb;
			}),
		} as unknown as Session["pty"],
		exit: (exitCode: number) => onExit({ exitCode }),
		emit: (data: string) => onData(data),
	};
}

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "repo/Session 1",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

describe("wirePtyEvents output handling", () => {
	beforeEach(() => vi.clearAllMocks());

	it("appends output to scrollback and broadcasts it without changing status", () => {
		const { pty, emit } = fakePty();
		const session = fakeSession({ pty });
		const onStatusChange = vi.fn();
		const client = { send: vi.fn() };

		wirePtyEvents(
			session,
			new Set<SessionClient>([client as unknown as SessionClient]),
			onStatusChange,
		);
		emit("hello");

		expect(session.scrollback).toBe("hello");
		expect(onStatusChange).not.toHaveBeenCalled();
		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "output", sessionId: "1", data: "hello" }),
		);
	});
});

describe("wirePtyEvents exit handling", () => {
	beforeEach(() => vi.clearAllMocks());

	it("marks a restored session that exits silently with a non-zero code as an error and logs it", () => {
		const { pty, exit } = fakePty();
		const session = fakeSession({ pty, restored: true, scrollback: "" });
		const onStatusChange =
			vi.fn<(s: Session, status: SessionStatus, exitCode?: number) => void>();

		wirePtyEvents(session, new Set<SessionClient>(), onStatusChange);
		exit(1);

		expect(onStatusChange).toHaveBeenCalledWith(session, "error", 1);
		expect(session.error).toBeTruthy();
		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("could not resume restored session"),
		);
	});

	it("treats a clean exit as done without logging", () => {
		const { pty, exit } = fakePty();
		const session = fakeSession({ pty, restored: true });
		const onStatusChange = vi.fn();

		wirePtyEvents(session, new Set<SessionClient>(), onStatusChange);
		exit(0);

		expect(onStatusChange).toHaveBeenCalledWith(session, "done", 0);
		expect(daemonLogMock).not.toHaveBeenCalled();
	});

	it("treats a non-zero exit with prior output as done, not an error", () => {
		const { pty, exit } = fakePty();
		const session = fakeSession({
			pty,
			restored: true,
			scrollback: "some output",
		});
		const onStatusChange = vi.fn();

		wirePtyEvents(session, new Set<SessionClient>(), onStatusChange);
		exit(1);

		expect(onStatusChange).toHaveBeenCalledWith(session, "done", 1);
		expect(daemonLogMock).not.toHaveBeenCalled();
	});
});
