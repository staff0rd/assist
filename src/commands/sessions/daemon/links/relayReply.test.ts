import { describe, expect, it, vi } from "vitest";
import type { SessionClient } from "../broadcast";
import { awaitLinkReply } from "./awaitLinkReply";
import { createRelayState } from "./LinkRelayState";
import { relayReply } from "./relayReply";

vi.mock("../daemonLog", () => ({ daemonLog: () => {} }));

function setup() {
	const state = createRelayState("work-win", {
		viewers: () => new Set(),
		onSessionsChanged: () => {},
		onHistoryChanged: () => {},
		onLimits: () => {},
	});
	const client = (): SessionClient & { sent: string[] } => {
		const sent: string[] = [];
		return { sent, send: (data) => sent.push(data) };
	};
	return { state, client };
}

describe("relayReply", () => {
	it("hands a peer's reply to the requester that sent its requestId", () => {
		const { state, client } = setup();
		const first = client();
		const second = client();
		awaitLinkReply(state, "a", first);
		awaitLinkReply(state, "b", second);
		relayReply(state, { type: "restart-webserver", ok: true, requestId: "b" });
		expect(second.sent).toHaveLength(1);
		expect(first.sent).toHaveLength(0);
		expect([...state.pendingReplies.keys()]).toEqual(["a"]);
	});

	it("falls back to the last requester when the peer echoes no requestId", () => {
		const { state, client } = setup();
		const last = client();
		state.lastRequester = last;
		relayReply(state, { type: "auto-update", version: "1.0.0" });
		expect(JSON.parse(last.sent[0])).toMatchObject({ version: "1.0.0" });
	});
});
