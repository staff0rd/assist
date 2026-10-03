import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { wirePtyEvents } from "./wirePtyEvents";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

describe("wirePtyEvents output handling", () => {
	beforeEach(() => vi.clearAllMocks());

	it("appends output to scrollback and broadcasts it without changing status", () => {
		const { pty, emitData } = makePty();
		const session = makeSession({
			id: "1",
			status: "running",
			scrollback: "",
			pty,
		});
		const onStatusChange = vi.fn();
		const client = { send: vi.fn() };

		wirePtyEvents(
			session,
			new Set<SessionClient>([client as unknown as SessionClient]),
			onStatusChange,
		);
		emitData("hello");

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
		const { pty, exit } = makePty();
		const session = makeSession({
			pty,
			status: "running",
			restored: true,
			scrollback: "",
		});
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

	it("logs a clean exit from running as an expected completion", () => {
		const { pty, exit } = makePty();
		const session = makeSession({ pty, restored: true, status: "running" });
		const onStatusChange = vi.fn();

		wirePtyEvents(session, new Set<SessionClient>(), onStatusChange);
		exit(0);

		expect(onStatusChange).toHaveBeenCalledWith(session, "done", 0);
		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("exited with code 0"),
		);
		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("expected completion"),
		);
	});

	it("logs an exit from waiting as an unexpected mid-session death with its exit code", () => {
		const { pty, exit } = makePty();
		const session = makeSession({
			pty,
			status: "waiting",
			scrollback: "prior conversation",
		});
		const onStatusChange = vi.fn();

		wirePtyEvents(session, new Set<SessionClient>(), onStatusChange);
		exit(0);

		expect(onStatusChange).toHaveBeenCalledWith(session, "done", 0);
		const line = daemonLogMock.mock.calls.at(-1)?.[0] as string;
		expect(line).toContain("exited with code 0");
		expect(line).toContain('from status "waiting"');
		expect(line).toContain("unexpected exit");
	});

	it("marks a non-zero exit as an error and logs it", () => {
		const { pty, exit } = makePty();
		const session = makeSession({
			pty,
			status: "running",
			scrollback: "startup failed: EMAXCONNSESSION",
		});
		const onStatusChange = vi.fn();

		wirePtyEvents(session, new Set<SessionClient>(), onStatusChange);
		exit(1);

		expect(onStatusChange).toHaveBeenCalledWith(session, "error", 1);
		expect(session.error).toBe("process exited with code 1");
		const line = daemonLogMock.mock.calls.at(-1)?.[0] as string;
		expect(line).toContain("exited with code 1");
		expect(line).toContain("marking error");
	});

	it("writes the failure reason to the terminal when the process dies without output", () => {
		const { pty, exit } = makePty();
		const session = makeSession({ pty, status: "running", scrollback: "" });
		const client = { send: vi.fn() };

		wirePtyEvents(
			session,
			new Set<SessionClient>([client as unknown as SessionClient]),
			(s, status) => {
				s.status = status;
			},
		);
		exit(1);

		expect(session.scrollback).toContain("process exited with code 1");
		expect(client.send).toHaveBeenCalledWith(
			expect.stringContaining("process exited with code 1"),
		);
	});

	it("names the vanished working directory so a reaped-tree failure explains itself", () => {
		const { pty, exit } = makePty();
		const session = makeSession({
			pty,
			status: "running",
			cwd: "/git/repo-4-was-reaped",
			scrollback: "",
		});

		wirePtyEvents(session, new Set<SessionClient>(), (s, status) => {
			s.status = status;
		});
		exit(1);

		expect(session.error).toBe(
			"process exited with code 1: working directory /git/repo-4-was-reaped no longer exists",
		);
		expect(session.scrollback).toContain("no longer exists");
	});

	it("leaves the terminal alone when the failing process already printed output", () => {
		const { pty, exit } = makePty();
		const session = makeSession({
			pty,
			status: "running",
			scrollback: "real error from the process",
		});

		wirePtyEvents(session, new Set<SessionClient>(), (s, status) => {
			s.status = status;
		});
		exit(1);

		expect(session.scrollback).toBe("real error from the process");
	});

	it("clears the dead pty handle when the process exits", () => {
		const { pty, exit } = makePty();
		const session = makeSession({ pty, status: "running" });

		wirePtyEvents(session, new Set<SessionClient>(), vi.fn());
		exit(1);

		expect(session.pty).toBeNull();
	});
});
