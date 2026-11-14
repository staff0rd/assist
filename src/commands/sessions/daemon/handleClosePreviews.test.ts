import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { PrPreview } from "../shared/SessionInfoBase";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { handleClosePreviews } from "./handleClosePreviews";
import { PrPreviewCoordinator } from "./PrPreviewCoordinator";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function makeClient(): SessionClient & { sent: Record<string, unknown>[] } {
	const sent: Record<string, unknown>[] = [];
	return { sent, send: (data: string) => sent.push(JSON.parse(data)) };
}

function preview(requestId: string, kind: PrPreview["kind"]): PrPreview {
	return { requestId, kind, title: "t", body: "b", prNumber: null };
}

function setup(routes = false) {
	const session = makeSession({ id: "1" });
	const sessions = new Map<string, Session>([["1", session]]);
	const notify = vi.fn();
	const prPreview = new PrPreviewCoordinator(sessions, notify);
	const m = {
		prPreview,
		links: { route: vi.fn(() => routes) },
	} as unknown as SessionManager;
	return { session, prPreview, notify, m };
}

describe("close-previews handler", () => {
	it("closes the show and blocking previews and dismisses the waiter", () => {
		const { session, prPreview, notify, m } = setup();
		const waiter = makeClient();
		prPreview.set(waiter, {
			sessionId: "1",
			requestId: "r1",
			kind: "ask",
			title: "t",
			body: "b",
			prNumber: null,
		});
		session.pendingShow = preview("s1", "show");
		const caller = makeClient();

		handleClosePreviews(caller, m, {
			type: "close-previews",
			sessionId: "1",
			reason: "phase done",
		});

		expect(session.pendingPrPreview).toBeUndefined();
		expect(session.pendingShow).toBeUndefined();
		expect(waiter.sent).toContainEqual({
			type: "pr-decision",
			requestId: "r1",
			decision: "reject",
			reason: "phase done",
			dismissed: true,
		});
		expect(caller.sent).toEqual([{ type: "ack", sessionId: "1" }]);
		expect(notify).toHaveBeenCalled();
		expect(daemonLogMock).toHaveBeenCalledWith(
			"pr-preview closed: id=1 requestId=s1 kind=show (phase done)",
		);
	});

	it("acks without closing anything when the session is unknown", () => {
		const { notify, m } = setup();
		const caller = makeClient();

		handleClosePreviews(caller, m, { sessionId: "nope", reason: "phase done" });

		expect(caller.sent).toEqual([{ type: "ack", sessionId: "nope" }]);
		expect(notify).not.toHaveBeenCalled();
	});

	it("leaves a session on a linked node to its own daemon", () => {
		const { session, m } = setup(true);
		session.pendingShow = preview("s1", "show");

		handleClosePreviews(makeClient(), m, {
			sessionId: "1",
			reason: "phase done",
		});

		expect(session.pendingShow).toBeDefined();
	});
});
