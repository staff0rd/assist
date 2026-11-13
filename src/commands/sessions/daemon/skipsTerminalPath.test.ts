import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { handleSnapshotRequest } from "./handleSnapshotRequest";
import { replayScrollback } from "./replayScrollback";
import { resizeSession } from "./resizeSession";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { writeToSession } from "./writeToSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./viewerSize", () => ({ rememberViewerSize: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function sdkSessions() {
	const control = createSdkSessionProcess("1", new AbortController());
	const write = vi.spyOn(control.process, "write");
	const resize = vi.spyOn(control.process, "resize");
	const session = makeSession({
		id: "1",
		status: "running",
		pty: control.process,
	});
	return {
		sessions: new Map<string, Session>([["1", session]]),
		write,
		resize,
	};
}

const skipped = (path: string) =>
	expect(daemonLogMock).toHaveBeenCalledWith(
		`session 1 ${path} skipped: Claude (SDK) session has no terminal`,
	);

describe("PTY-only paths on a Claude (SDK) session", () => {
	beforeEach(() => vi.clearAllMocks());

	it("skips terminal input with a log line", () => {
		const { sessions, write } = sdkSessions();
		writeToSession(sessions, "1", "ls\r", vi.fn());
		expect(write).not.toHaveBeenCalled();
		skipped("input");
	});

	it("skips resize with a log line", () => {
		const { sessions, resize } = sdkSessions();
		resizeSession(sessions, "1", 120, 40);
		expect(resize).not.toHaveBeenCalled();
		skipped("resize");
	});

	it("skips the screen-mirror snapshot", () => {
		const { sessions } = sdkSessions();
		const send = vi.fn();
		const manager = {
			update: (fn: (s: Map<string, Session>) => boolean) => fn(sessions),
		};
		handleSnapshotRequest({ send } as never, manager as never, {
			sessionId: "1",
		});
		expect(send).not.toHaveBeenCalled();
		skipped("snapshot");
	});

	it("skips scrollback replay but still replays terminal sessions", () => {
		const { sessions } = sdkSessions();
		sessions.set(
			"2",
			makeSession({
				id: "2",
				status: "running",
				pty: makePty().pty,
				scrollback: "hi",
			}),
		);
		const send = vi.fn();
		replayScrollback(sessions, { send } as never);
		skipped("scrollback replay");
		expect(send).toHaveBeenCalledTimes(1);
	});
});
