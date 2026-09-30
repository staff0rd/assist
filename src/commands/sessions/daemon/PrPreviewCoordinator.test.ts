import { describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { PrPreviewCoordinator } from "./PrPreviewCoordinator";

function makeClient(): SessionClient & { sent: Record<string, unknown>[] } {
	const sent: Record<string, unknown>[] = [];
	return { sent, send: (data: string) => sent.push(JSON.parse(data)) };
}

function makeSessions(...ids: string[]): Map<string, Session> {
	return new Map(ids.map((id) => [id, { id } as Session]));
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
});
