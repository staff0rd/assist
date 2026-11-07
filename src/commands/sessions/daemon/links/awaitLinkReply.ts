import type { SessionClient } from "../broadcast";
import type { LinkRelayState } from "./LinkRelayState";

const REPLY_TIMEOUT_MS = 30_000;

export function awaitLinkReply(
	state: LinkRelayState,
	requestId: unknown,
	client: SessionClient,
): void {
	if (typeof requestId !== "string") return;
	state.pendingReplies.set(requestId, client);
	setTimeout(
		() => state.pendingReplies.delete(requestId),
		REPLY_TIMEOUT_MS,
	).unref?.();
}
