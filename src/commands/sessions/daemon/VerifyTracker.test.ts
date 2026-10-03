import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { VerifyTracker } from "./VerifyTracker";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function client(): SessionClient {
	return { send: vi.fn() };
}

describe("VerifyTracker", () => {
	let sessions: Map<string, Session>;
	let notify: Mock<() => void>;
	let tracker: VerifyTracker;

	beforeEach(() => {
		daemonLogMock.mockClear();
		sessions = new Map([["1", makeSession({ id: "1" })]]);
		notify = vi.fn();
		tracker = new VerifyTracker(sessions, notify);
	});

	it("flags the session and broadcasts while the connection is open", () => {
		tracker.start(client(), "1");

		expect(sessions.get("1")?.verifying).toBe(true);
		expect(notify).toHaveBeenCalledOnce();
		expect(daemonLogMock).toHaveBeenCalledWith("verify-started received: id=1");
	});

	it("clears the flag when that connection closes", () => {
		const c = client();
		tracker.start(c, "1");
		notify.mockClear();

		tracker.clear(c);

		expect(sessions.get("1")?.verifying).toBe(false);
		expect(notify).toHaveBeenCalledOnce();
		expect(daemonLogMock).toHaveBeenCalledWith(
			"verify connection closed: id=1",
		);
	});

	it("holds the flag until the last verify connection for a session closes", () => {
		const first = client();
		const second = client();
		tracker.start(first, "1");
		tracker.start(second, "1");

		tracker.clear(first);
		expect(sessions.get("1")?.verifying).toBe(true);

		tracker.clear(second);
		expect(sessions.get("1")?.verifying).toBe(false);
	});

	it("ignores a close from a client that never announced a verify", () => {
		tracker.clear(client());

		expect(notify).not.toHaveBeenCalled();
	});

	it("ignores a verify announced for an unknown session", () => {
		tracker.start(client(), "nope");

		expect(notify).not.toHaveBeenCalled();
		expect(daemonLogMock).toHaveBeenCalledWith(
			"verify-started for unknown session id=nope (ignoring)",
		);
	});
});
