import { connectLinkWebSocket } from "./connectLinkWebSocket";
import { guardLinkCallback } from "./guardLinkCallback";
import type { NodeLinkDeps } from "./LinkContext";
import type { LinkTransport } from "./LinkTransport";
import type { LinkSpec } from "./LinkStatus";

export type NodeLinksOptions = {
	specs?: () => LinkSpec[];
	localNode?: () => string;
	transport?: LinkTransport;
	reconnectMs?: number;
	blockedRetryMs?: number;
	createTimeoutMs?: number;
};

type LinkCallbacks = Pick<
	NodeLinkDeps,
	"viewers" | "onSessionsChanged" | "onStateChanged" | "onHistoryChanged"
>;

export function linkDeps(
	options: NodeLinksOptions,
	callbacks: LinkCallbacks,
): NodeLinkDeps {
	return {
		viewers: callbacks.viewers,
		onSessionsChanged: guardLinkCallback(
			"links: sessions-changed handler",
			callbacks.onSessionsChanged,
		),
		onStateChanged: guardLinkCallback(
			"links: state-changed handler",
			callbacks.onStateChanged,
		),
		onHistoryChanged: guardLinkCallback(
			"links: history-changed handler",
			callbacks.onHistoryChanged,
		),
		transport: options.transport ?? connectLinkWebSocket,
		reconnectMs: options.reconnectMs ?? 3_000,
		blockedRetryMs: options.blockedRetryMs ?? 60_000,
		createTimeoutMs: options.createTimeoutMs ?? 15_000,
	};
}
