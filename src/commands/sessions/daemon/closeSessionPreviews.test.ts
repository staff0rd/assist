import { describe, expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { PrPreview } from "../shared/SessionInfoBase";
import type { SessionClient } from "./broadcast";
import { closeSessionPreviews } from "./closeSessionPreviews";

function makeClient(): SessionClient & { sent: Record<string, unknown>[] } {
	const sent: Record<string, unknown>[] = [];
	return { sent, send: (data: string) => sent.push(JSON.parse(data)) };
}

function preview(requestId: string, kind: PrPreview["kind"]): PrPreview {
	return { requestId, kind, title: "t", body: "b", prNumber: null };
}

describe("closeSessionPreviews", () => {
	it("rejects the blocking preview so its waiter exits, and clears both panels", () => {
		const session = makeSession({ id: "1" });
		session.pendingPrPreview = preview("r1", "ask");
		session.pendingShow = preview("s1", "show");
		const waiter = makeClient();
		const waiters = new Map([["1", waiter as SessionClient]]);

		const closed = closeSessionPreviews(session, waiters, "session dismissed");

		expect(closed).toBe(true);
		expect(waiter.sent).toEqual([
			{
				type: "pr-decision",
				requestId: "r1",
				decision: "reject",
				reason: "session dismissed",
				dismissed: true,
			},
		]);
		expect(waiters.size).toBe(0);
		expect(session.pendingPrPreview).toBeUndefined();
		expect(session.pendingShow).toBeUndefined();
	});

	it("clears a show preview without messaging anyone", () => {
		const session = makeSession({ id: "1" });
		session.pendingPrPreview = preview("s1", "show");

		expect(closeSessionPreviews(session, new Map(), "session dismissed")).toBe(
			true,
		);
		expect(session.pendingPrPreview).toBeUndefined();
	});

	it("reports nothing closed when no preview is open", () => {
		const session = makeSession({ id: "1" });

		expect(closeSessionPreviews(session, new Map(), "session dismissed")).toBe(
			false,
		);
	});
});
