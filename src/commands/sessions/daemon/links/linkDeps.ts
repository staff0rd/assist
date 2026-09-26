import { connectLinkWebSocket } from "./connectLinkWebSocket";
import type { NodeLinkDeps } from "./LinkContext";
import type { LinkTransport } from "./LinkTransport";
import type { LinkSpec } from "./LinkStatus";
import type { TunnelFactory } from "./LinkTunnel";
import { selfUpdatePeer } from "./selfUpdatePeer";
import { sshTunnelFor } from "./sshTunnelFor";

export type NodeLinksOptions = {
	specs?: () => LinkSpec[];
	localNode?: () => string;
	transport?: LinkTransport;
	tunnel?: TunnelFactory;
	heal?: (url: string) => Promise<void>;
	reconnectMs?: number;
	createTimeoutMs?: number;
};

type LinkCallbacks = Pick<
	NodeLinkDeps,
	"viewers" | "onSessionsChanged" | "onStateChanged"
>;

export function linkDeps(
	options: NodeLinksOptions,
	callbacks: LinkCallbacks,
): NodeLinkDeps {
	return {
		...callbacks,
		transport: options.transport ?? connectLinkWebSocket,
		tunnel: options.tunnel ?? sshTunnelFor,
		heal: options.heal ?? selfUpdatePeer,
		reconnectMs: options.reconnectMs ?? 3_000,
		createTimeoutMs: options.createTimeoutMs ?? 15_000,
	};
}
