import { describe, expect, it } from "vitest";
import type { SessionClient } from "../broadcast";
import { createRelayState } from "./LinkRelayState";
import { relayNotice } from "./relayNotice";

function setup() {
	const sent: Record<string, unknown>[] = [];
	const viewer: SessionClient = {
		send: (data) => sent.push(JSON.parse(data)),
	};
	const state = createRelayState("work-win", {
		viewers: () => new Set([viewer]),
		onSessionsChanged: () => {},
		onHistoryChanged: () => {},
		onLimits: () => {},
	});
	return { state, sent };
}

describe("relayNotice", () => {
	it("namespaces a transfer's source id with the peer node", () => {
		const { state, sent } = setup();
		relayNotice(state, {
			type: "notice",
			message: "Transferred to mac",
			transfer: { sourceId: "7", sessionId: "mac:3", node: "mac" },
		});
		expect(sent).toEqual([
			{
				type: "notice",
				message: "Transferred to mac",
				transfer: { sourceId: "work-win:7", sessionId: "mac:3", node: "mac" },
			},
		]);
	});

	it("relays a plain notice unchanged", () => {
		const { state, sent } = setup();
		relayNotice(state, { type: "notice", message: "up to date" });
		expect(sent).toEqual([{ type: "notice", message: "up to date" }]);
	});
});
