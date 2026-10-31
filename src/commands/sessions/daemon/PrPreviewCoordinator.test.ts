import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { PrPreviewCoordinator } from "./PrPreviewCoordinator";

function makeClient(): SessionClient & { sent: Record<string, unknown>[] } {
	const sent: Record<string, unknown>[] = [];
	return { sent, send: (data: string) => sent.push(JSON.parse(data)) };
}

function makeSessions(...ids: string[]): Map<string, Session> {
	return new Map(ids.map((id) => [id, makeSession({ id })]));
}

function previewMsg(sessionId: string, requestId: string) {
	return {
		type: "pr-preview",
		sessionId,
		requestId,
		title: "Add feature",
		body: "## What\n\nstuff",
		prNumber: null,
	};
}

describe("PrPreviewCoordinator", () => {
	it("stores the preview on the session and notifies", () => {
		const sessions = makeSessions("1");
		const notify = vi.fn();
		const coord = new PrPreviewCoordinator(sessions, notify);

		coord.set(makeClient(), previewMsg("1", "r1"));

		expect(sessions.get("1")?.pendingPrPreview).toMatchObject({
			requestId: "r1",
			title: "Add feature",
			prNumber: null,
		});
		expect(notify).toHaveBeenCalled();
	});

	it("carries the resolved draft state onto a new-PR preview", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());

		coord.set(makeClient(), { ...previewMsg("1", "r1"), draft: true });

		expect(sessions.get("1")?.pendingPrPreview?.draft).toBe(true);
	});

	it("leaves the draft state off an update to an existing PR", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());

		coord.set(makeClient(), {
			...previewMsg("1", "r1"),
			prNumber: 42,
			draft: true,
		});

		expect(sessions.get("1")?.pendingPrPreview?.draft).toBeUndefined();
	});

	it("replies with an error for an unknown session", () => {
		const client = makeClient();
		const coord = new PrPreviewCoordinator(makeSessions(), vi.fn());

		coord.set(client, previewMsg("9", "r1"));

		expect(client.sent[0]).toMatchObject({ type: "error" });
	});

	it("delivers the decision to the waiting client and clears the preview", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, previewMsg("1", "r1"));

		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "approve",
			screenshots: ["![a](u1)"],
		});

		expect(client.sent.at(-1)).toMatchObject({
			type: "pr-decision",
			requestId: "r1",
			decision: "approve",
			screenshots: ["![a](u1)"],
		});
		expect(sessions.get("1")?.pendingPrPreview).toBeUndefined();
	});

	it("forwards the Review and Post chain choices to the waiting client", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, previewMsg("1", "r1"));

		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "approve",
			reviewAfter: true,
			announceAfter: false,
		});

		expect(client.sent.at(-1)).toMatchObject({
			reviewAfter: true,
			announceAfter: false,
		});
	});

	it("keeps the canStart marker only on a backlog-item preview", () => {
		const sessions = makeSessions("1", "2");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());

		coord.set(makeClient(), {
			...previewMsg("1", "r1"),
			kind: "backlog-item",
			canStart: true,
		});
		coord.set(makeClient(), { ...previewMsg("2", "r2"), canStart: true });

		expect(sessions.get("1")?.pendingPrPreview?.canStart).toBe(true);
		expect(sessions.get("2")?.pendingPrPreview?.canStart).toBeUndefined();
	});

	it("forwards the autostart choice to the waiting client", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, previewMsg("1", "r1"));

		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "approve",
			autostart: true,
		});

		expect(client.sent.at(-1)).toMatchObject({ autostart: true });
	});

	it("approves a startable backlog-item preview at once with autostart when the session auto-approves", () => {
		const sessions = new Map([
			["1", makeSession({ id: "1", autoApprove: true })],
		]);
		const notify = vi.fn();
		const coord = new PrPreviewCoordinator(sessions, notify);
		const client = makeClient();

		coord.set(client, {
			...previewMsg("1", "r1"),
			kind: "backlog-item",
			canStart: true,
		});

		expect(client.sent.at(-1)).toMatchObject({
			type: "pr-decision",
			requestId: "r1",
			decision: "approve",
			autostart: true,
		});
		expect(sessions.get("1")?.pendingPrPreview).toBeUndefined();
		expect(notify).toHaveBeenCalled();
	});

	it("approves a refine session's startable plan update with autostart", () => {
		const sessions = new Map([
			[
				"1",
				makeSession({
					id: "1",
					commandType: "assist",
					assistArgs: ["refine", "--once", "254"],
					autoApprove: true,
				}),
			],
		]);
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();

		coord.set(client, {
			...previewMsg("1", "r1"),
			title: "Update the plan for a254: Thing",
			kind: "backlog-item",
			canStart: true,
		});

		expect(client.sent.at(-1)).toMatchObject({
			type: "pr-decision",
			decision: "approve",
			autostart: true,
		});
	});

	it.each([
		["a startable preview while auto-approve is off", false, "backlog-item"],
		["a non-startable preview while auto-approve is on", true, "pr-comment"],
		["a PR preview while auto-approve is on", true, "pr"],
	])("waits for the user on %s", (_label, autoApprove, kind) => {
		const sessions = new Map([["1", makeSession({ id: "1", autoApprove })]]);
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();

		coord.set(client, { ...previewMsg("1", "r1"), kind, canStart: true });

		expect(client.sent).toEqual([]);
		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r1");
	});

	it("forwards inline comments to the waiting client on rejection", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, previewMsg("1", "r1"));

		const comments = [{ quote: "stuff", note: "expand this" }];
		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "reject",
			comments,
		});

		expect(client.sent.at(-1)).toMatchObject({
			type: "pr-decision",
			decision: "reject",
			comments,
		});
	});

	it("ignores a decision whose requestId does not match the pending preview", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, previewMsg("1", "r1"));
		const before = client.sent.length;

		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "stale",
			decision: "reject",
		});

		expect(client.sent.length).toBe(before);
		expect(sessions.get("1")?.pendingPrPreview).toBeDefined();
	});

	it("clears a pending preview when its waiting client disconnects", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, previewMsg("1", "r1"));

		coord.clearWaiter(client);

		expect(sessions.get("1")?.pendingPrPreview).toBeUndefined();
	});

	it("supersedes a pending preview in place when another blocking preview arrives", () => {
		const sessions = makeSessions("1");
		const notify = vi.fn();
		const coord = new PrPreviewCoordinator(sessions, notify);
		const oldWaiter = makeClient();
		const newWaiter = makeClient();
		coord.set(oldWaiter, { ...previewMsg("1", "r1"), kind: "ask" });

		coord.set(newWaiter, { ...previewMsg("1", "r2"), kind: "ask" });
		coord.clearWaiter(oldWaiter);

		expect(oldWaiter.sent).toEqual([
			{ type: "pr-superseded", requestId: "r1", supersededBy: "r2" },
		]);
		expect(sessions.get("1")?.pendingPrPreview).toMatchObject({
			requestId: "r2",
			supersedes: "r1",
		});
		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r2",
			decision: "approve",
		});
		expect(newWaiter.sent.at(-1)).toMatchObject({
			type: "pr-decision",
			requestId: "r2",
		});
	});

	it("does not supersede anything when a show arrives over a pending preview", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const waiter = makeClient();
		coord.set(waiter, { ...previewMsg("1", "r1"), kind: "ask" });

		coord.set(makeClient(), { ...previewMsg("1", "r2"), kind: "show" });

		expect(waiter.sent).toEqual([]);
		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r1");
	});

	it("replaces a show with a blocking preview without a supersede", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const shower = makeClient();
		coord.set(shower, { ...previewMsg("1", "r1"), kind: "show" });

		coord.set(makeClient(), { ...previewMsg("1", "r2"), kind: "ask" });

		expect(shower.sent).toEqual([{ type: "show-ack", requestId: "r1" }]);
		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r2");
		expect(sessions.get("1")?.pendingPrPreview?.supersedes).toBeUndefined();
	});

	it("keeps a show preview after its sending client disconnects", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const client = makeClient();
		coord.set(client, { ...previewMsg("1", "r1"), kind: "show" });

		coord.clearWaiter(client);

		expect(sessions.get("1")?.pendingPrPreview?.kind).toBe("show");
	});

	it("clears a show preview when the user closes it", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		coord.set(makeClient(), { ...previewMsg("1", "r1"), kind: "show" });

		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "reject",
		});

		expect(sessions.get("1")?.pendingPrPreview).toBeUndefined();
	});

	it("acknowledges a show so its sender can exit", () => {
		const client = makeClient();
		const coord = new PrPreviewCoordinator(makeSessions("1"), vi.fn());

		coord.set(client, { ...previewMsg("1", "r1"), kind: "show" });

		expect(client.sent.at(-1)).toMatchObject({
			type: "show-ack",
			requestId: "r1",
		});
	});

	it("replaces an earlier show with a later one", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		coord.set(makeClient(), { ...previewMsg("1", "r1"), kind: "show" });

		coord.set(makeClient(), { ...previewMsg("1", "r2"), kind: "show" });

		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r2");
	});

	it("stacks a show over a pending approval without disturbing it", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const waiter = makeClient();
		coord.set(waiter, {
			...previewMsg("1", "r1"),
			kind: "high-level-review",
			prNumber: 7,
		});
		const shower = makeClient();

		coord.set(shower, { ...previewMsg("1", "r2"), kind: "show" });

		expect(shower.sent.at(-1)).toMatchObject({
			type: "show-ack",
			requestId: "r2",
		});
		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r1");
		expect(sessions.get("1")?.pendingShow?.requestId).toBe("r2");
		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r2",
			decision: "reject",
		});
		expect(sessions.get("1")?.pendingShow).toBeUndefined();
		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r1");
		expect(waiter.sent).toHaveLength(0);
		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "approve",
		});
		expect(waiter.sent.at(-1)).toMatchObject({ decision: "approve" });
	});

	it("resolves an approval decided while a show is stacked over it", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		const waiter = makeClient();
		coord.set(waiter, previewMsg("1", "r1"));
		coord.set(makeClient(), { ...previewMsg("1", "r2"), kind: "show" });

		coord.decide({
			type: "pr-decision",
			sessionId: "1",
			requestId: "r1",
			decision: "reject",
		});

		expect(waiter.sent.at(-1)).toMatchObject({ decision: "reject" });
		expect(sessions.get("1")?.pendingPrPreview).toBeUndefined();
		expect(sessions.get("1")?.pendingShow?.requestId).toBe("r2");
	});

	it("closes a stacked show when a new blocking preview arrives", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		coord.set(makeClient(), { ...previewMsg("1", "r1"), kind: "ask" });
		coord.set(makeClient(), { ...previewMsg("1", "r2"), kind: "show" });

		coord.set(makeClient(), { ...previewMsg("1", "r3"), kind: "backlog-item" });

		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r3");
		expect(sessions.get("1")?.pendingShow).toBeUndefined();
		coord.set(makeClient(), { ...previewMsg("1", "r4"), kind: "show" });
		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r3");
		expect(sessions.get("1")?.pendingShow?.requestId).toBe("r4");
	});

	it("replaces an open show with a new blocking preview", () => {
		const sessions = makeSessions("1");
		const coord = new PrPreviewCoordinator(sessions, vi.fn());
		coord.set(makeClient(), { ...previewMsg("1", "r1"), kind: "show" });

		coord.set(makeClient(), { ...previewMsg("1", "r2"), kind: "ask" });

		expect(sessions.get("1")?.pendingPrPreview?.requestId).toBe("r2");
		expect(sessions.get("1")?.pendingShow).toBeUndefined();
	});
});
