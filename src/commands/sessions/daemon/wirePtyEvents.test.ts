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
	return {
		pty: {
			onData: vi.fn(),
			onExit: vi.fn((cb: ExitHandler) => {
				onExit = cb;
			}),
		} as unknown as Session["pty"],
		exit: (exitCode: number) => onExit({ exitCode }),
	};
}

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "repo/Session 1",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		pty: null,
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		...overrides,
	};
}

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
