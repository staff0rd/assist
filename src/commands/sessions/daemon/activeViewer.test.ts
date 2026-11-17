import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { resizeSession } from "./resizeSession";
import { writeToSession } from "./writeToSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./viewerSize", () => ({ rememberViewerSize: vi.fn() }));

function liveSession(overrides: Partial<Session> = {}) {
	const { pty } = makePty();
	const session = makeSession({
		id: "1",
		status: "waiting",
		pty,
		...overrides,
	});
	return { pty, session, sessions: new Map([["1", session]]) };
}

describe("active viewer", () => {
	const onClaim = vi.fn();

	beforeEach(() => {
		onClaim.mockClear();
		vi.useFakeTimers();
	});
	afterEach(() => vi.useRealTimers());

	it("lets the first resize claim the session when no viewer is active", () => {
		const { pty, session, sessions } = liveSession();

		resizeSession(sessions, "1", 120, 40, { viewerId: "a", onClaim });

		expect(onClaim).toHaveBeenCalledOnce();
		expect(session.activeViewer).toBe("a");
		expect(pty.resize).toHaveBeenCalledWith(120, 40);
	});

	it("ignores resizes from an inactive viewer", () => {
		const { pty, session, sessions } = liveSession({ activeViewer: "a" });

		resizeSession(sessions, "1", 80, 20, { viewerId: "b", onClaim });

		expect(onClaim).not.toHaveBeenCalled();
		expect(session.activeViewer).toBe("a");
		expect(pty.resize).not.toHaveBeenCalled();
	});

	it("applies resizes from the active viewer without re-announcing it", () => {
		const { pty, sessions } = liveSession({ activeViewer: "a" });

		resizeSession(sessions, "1", 100, 30, { viewerId: "a", onClaim });

		expect(onClaim).not.toHaveBeenCalled();
		expect(pty.resize).toHaveBeenCalledWith(100, 30);
	});

	it("still applies resizes that carry no viewer", () => {
		const { pty, sessions } = liveSession({ activeViewer: "a" });

		resizeSession(sessions, "1", 100, 30);

		expect(pty.resize).toHaveBeenCalledWith(100, 30);
	});

	it("claims the session on input", () => {
		const { pty, session, sessions } = liveSession({ activeViewer: "a" });

		writeToSession(sessions, "1", "x", vi.fn(), {
			viewerId: "b",
			viewerNode: "node-b",
			onClaim,
		});

		expect(onClaim).toHaveBeenCalledOnce();
		expect(session.activeViewer).toBe("b");
		expect(session.activeViewerNode).toBe("node-b");
		expect(pty.write).toHaveBeenCalledWith("x");
	});

	it("records the viewer and its node on SDK input", () => {
		const { pty, session, sessions } = liveSession({ activeViewer: "a" });
		const send = vi.fn();
		Object.assign(pty, { sdk: { send } });

		writeToSession(sessions, "1", "\x1b[200~hi\x1b[201~", vi.fn(), {
			viewerId: "b",
			viewerNode: "node-b",
			onClaim,
		});

		expect(onClaim).toHaveBeenCalledOnce();
		expect(session.activeViewer).toBe("b");
		expect(session.activeViewerNode).toBe("node-b");
		expect(send).toHaveBeenCalledWith("hi");
		expect(pty.write).not.toHaveBeenCalled();
	});

	it("drops automatic terminal responses from an inactive viewer", () => {
		const { pty, session, sessions } = liveSession({ activeViewer: "a" });

		writeToSession(sessions, "1", "\x1b[?62;22c\x1b[12;1R", vi.fn(), {
			viewerId: "b",
			onClaim,
		});

		expect(onClaim).not.toHaveBeenCalled();
		expect(session.activeViewer).toBe("a");
		expect(pty.write).not.toHaveBeenCalled();
	});

	it("forwards terminal responses without claiming a free session", () => {
		const { pty, session, sessions } = liveSession();

		writeToSession(sessions, "1", "\x1b]11;rgb:0000/0000/0000\x1b\\", vi.fn(), {
			viewerId: "b",
			onClaim,
		});

		expect(onClaim).not.toHaveBeenCalled();
		expect(session.activeViewer).toBeUndefined();
		expect(pty.write).toHaveBeenCalledOnce();
	});

	it("still claims on keystrokes that are escape sequences", () => {
		const { session, sessions } = liveSession({ activeViewer: "a" });

		writeToSession(sessions, "1", "\x1b[A", vi.fn(), {
			viewerId: "b",
			onClaim,
		});

		expect(onClaim).toHaveBeenCalledOnce();
		expect(session.activeViewer).toBe("b");
	});

	it("lets a takeover resize claim from another viewer", () => {
		const { pty, session, sessions } = liveSession({
			activeViewer: "a",
			cols: 120,
			rows: 40,
		});

		resizeSession(sessions, "1", 80, 20, { viewerId: "b", claim: true });

		expect(session.activeViewer).toBe("b");
		expect(pty.resize.mock.calls).toEqual([[80, 20]]);
	});

	it("nudges the pty when a takeover keeps the same size", () => {
		const { pty, sessions } = liveSession({
			activeViewer: "a",
			cols: 120,
			rows: 40,
		});

		resizeSession(sessions, "1", 120, 40, { viewerId: "b", claim: true });
		vi.runAllTimers();

		expect(pty.resize.mock.calls).toEqual([
			[120, 40],
			[119, 40],
			[120, 40],
		]);
	});

	it("sends a local takeover the current screen instead of nudging", () => {
		const { pty, sessions } = liveSession({
			activeViewer: "a",
			cols: 120,
			rows: 40,
			scrollback: "prompt",
		});
		const sendSnapshot = vi.fn();

		resizeSession(sessions, "1", 120, 40, {
			viewerId: "b",
			claim: true,
			sendSnapshot,
		});
		vi.runAllTimers();

		expect(pty.resize.mock.calls).toEqual([[120, 40]]);
		expect(sendSnapshot).toHaveBeenCalledWith("prompt");
	});

	it("redraws a pane whose own size changed even when the pty's did not", () => {
		const { sessions } = liveSession({
			activeViewer: "a",
			cols: 120,
			rows: 40,
			scrollback: "prompt",
		});
		const sendSnapshot = vi.fn();

		resizeSession(sessions, "1", 120, 40, {
			viewerId: "a",
			refresh: true,
			sendSnapshot,
		});

		expect(sendSnapshot).toHaveBeenCalledWith("prompt");
	});

	it("leaves a plain resize to the harness's own redraw", () => {
		const { sessions } = liveSession({
			activeViewer: "a",
			cols: 120,
			rows: 40,
		});
		const sendSnapshot = vi.fn();

		resizeSession(sessions, "1", 100, 40, { viewerId: "a", sendSnapshot });

		expect(sendSnapshot).not.toHaveBeenCalled();
	});
});
