import type { SessionClient } from "../broadcast";
import type { LinkRelayState } from "./LinkRelayState";

export function takePendingCreator(
	state: LinkRelayState,
	traceId?: unknown,
): SessionClient | undefined {
	const index = pendingIndex(state, traceId);
	if (index === -1) return undefined;
	const [pending] = state.pendingCreators.splice(index, 1);
	if (!pending) return undefined;
	clearTimeout(pending.timer);
	return pending.client;
}

function pendingIndex(state: LinkRelayState, traceId: unknown): number {
	if (typeof traceId !== "string") return 0;
	return state.pendingCreators.findIndex((p) => p.traceId === traceId);
}
