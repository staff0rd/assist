import { describe, expect, it } from "vitest";
import type { SessionClient } from "../broadcast";
import { createRelayState } from "./LinkRelayState";
import { takePendingCreator } from "./takePendingCreator";

function stateWith(...traceIds: (string | undefined)[]) {
	const state = createRelayState("peer", {
		viewers: () => new Set(),
		onSessionsChanged: () => {},
		onHistoryChanged: () => {},
	});
	const clients = traceIds.map((traceId) => {
		const client: SessionClient = { send: () => {} };
		const timer = setTimeout(() => {}, 60_000);
		timer.unref?.();
		state.pendingCreators.push({ client, timer, traceId });
		return client;
	});
	return { state, clients };
}

describe("takePendingCreator", () => {
	it("hands a traced reply to the creator with that trace, not the oldest", () => {
		const { state, clients } = stateWith("slow-transfer", "quick-create");
		expect(takePendingCreator(state, "quick-create")).toBe(clients[1]);
		expect(state.pendingCreators.map((p) => p.traceId)).toEqual([
			"slow-transfer",
		]);
	});

	it("falls back to the oldest creator for an untraced reply", () => {
		const { state, clients } = stateWith("a", "b");
		expect(takePendingCreator(state)).toBe(clients[0]);
	});

	it("returns nothing when no creator carries the reply's trace", () => {
		const { state } = stateWith("a");
		expect(takePendingCreator(state, "gone")).toBeUndefined();
		expect(state.pendingCreators).toHaveLength(1);
	});
});
