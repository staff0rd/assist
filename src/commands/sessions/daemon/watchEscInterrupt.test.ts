import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import {
	disarmEscInterrupt,
	noteOutputForEscInterrupt,
	watchEscInterrupt,
} from "./watchEscInterrupt";

const ESC = "\x1b";

function makeSession(status: Session["status"] = "running"): Session {
	return {
		id: "1",
		name: "test",
		commandType: "claude",
		status,
		startedAt: 0,
		pty: null,
		scrollback: "",
	};
}

describe("watchEscInterrupt", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("flips running -> waiting a bounded time after an ESC keystroke", () => {
		const session = makeSession("running");
		const onStatusChange = vi.fn();

		watchEscInterrupt(session, ESC, onStatusChange);
		vi.advanceTimersByTime(999);
		expect(onStatusChange).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(onStatusChange).toHaveBeenCalledWith(session, "waiting");
	});

	it("ignores ESC when the session is not running", () => {
		const session = makeSession("waiting");
		const onStatusChange = vi.fn();

		watchEscInterrupt(session, ESC, onStatusChange);
		vi.advanceTimersByTime(10_000);
		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("ignores arrow/function keys that merely start with ESC", () => {
		const session = makeSession("running");
		const onStatusChange = vi.fn();

		watchEscInterrupt(session, `${ESC}[A`, onStatusChange);
		watchEscInterrupt(session, "hello", onStatusChange);
		vi.advanceTimersByTime(10_000);
		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("defers the flip while output keeps streaming, then flips once it settles", () => {
		const session = makeSession("running");
		const onStatusChange = vi.fn();

		watchEscInterrupt(session, ESC, onStatusChange);
		vi.advanceTimersByTime(800);
		noteOutputForEscInterrupt(session, onStatusChange);
		vi.advanceTimersByTime(800);
		expect(onStatusChange).not.toHaveBeenCalled();

		vi.advanceTimersByTime(200);
		expect(onStatusChange).toHaveBeenCalledOnce();
		expect(onStatusChange).toHaveBeenCalledWith(session, "waiting");
	});

	it("does not arm on output when no ESC interrupt is pending", () => {
		const session = makeSession("running");
		const onStatusChange = vi.fn();

		noteOutputForEscInterrupt(session, onStatusChange);
		vi.advanceTimersByTime(10_000);
		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("does not flip once disarmed", () => {
		const session = makeSession("running");
		const onStatusChange = vi.fn();

		watchEscInterrupt(session, ESC, onStatusChange);
		disarmEscInterrupt(session);
		vi.advanceTimersByTime(10_000);
		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("does not flip if the session left running before the timer fires", () => {
		const session = makeSession("running");
		const onStatusChange = vi.fn();

		watchEscInterrupt(session, ESC, onStatusChange);
		session.status = "done";
		vi.advanceTimersByTime(10_000);
		expect(onStatusChange).not.toHaveBeenCalled();
	});
});
