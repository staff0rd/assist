import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionStatus } from "./createSession";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { createSdkTurnTracker } from "./sdk/createSdkTurnTracker";
import { wireSdkEvents } from "./wireSdkEvents";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function resumedSdkSession(status: SessionStatus) {
	const control = createSdkSessionProcess("18", new AbortController());
	const turn = createSdkTurnTracker("session 18", control, vi.fn());
	const request = vi.fn(() => Promise.resolve());
	control.bind({
		send: turn.send,
		dequeue: turn.dequeue,
		interrupt: () => turn.interrupt(request),
	});
	const session = makeSession({ id: "18", status, pty: control.process });
	const onStatusChange = vi.fn((s: typeof session, next: SessionStatus) => {
		s.status = next;
	});
	wireSdkEvents(session, onStatusChange);
	return {
		session,
		turn,
		request,
		stop: () => control.process.sdk?.interrupt(),
	};
}

describe("Stop on a resumed SDK session", () => {
	it("settles a session displayed as Working with no internal turn into waiting", () => {
		const { session, request, stop } = resumedSdkSession("running");
		stop();
		expect(request).not.toHaveBeenCalled();
		expect(session.status).toBe("waiting");
	});

	it("interrupts an active turn and settles into waiting when it ends", () => {
		const { session, turn, request, stop } = resumedSdkSession("waiting");
		turn.setStatus("running");
		expect(session.status).toBe("running");
		stop();
		expect(request).toHaveBeenCalledTimes(1);
		expect(session.sdkInterrupting).toBe(true);
		turn.setStatus("waiting");
		expect(session.status).toBe("waiting");
		expect(session.sdkInterrupting).toBeUndefined();
	});
});
