import type { SessionClient } from "../broadcast";
import type { LaunchCircuitBreaker } from "../LaunchCircuitBreaker";
import type { LinkRelayState } from "./LinkRelayState";
import type { LinkSocket, LinkTransport } from "./LinkTransport";
import type { LinkSpec, LinkState } from "./LinkStatus";
import type { LinkTunnel, TunnelFactory } from "./LinkTunnel";

export type NodeLinkDeps = {
	viewers: () => Set<SessionClient>;
	onSessionsChanged: () => void;
	onStateChanged: () => void;
	transport: LinkTransport;
	tunnel: TunnelFactory;
	heal: (url: string) => Promise<void>;
	reconnectMs: number;
	createTimeoutMs: number;
};

export type LinkContext = {
	spec: LinkSpec;
	deps: NodeLinkDeps;
	relay: LinkRelayState;
	breaker: LaunchCircuitBreaker;
	tunnel?: LinkTunnel;
	socket: LinkSocket | null;
	greeted: boolean;
	state: LinkState;
	lastError?: { message: string; at: string };
	peer?: { version: string; protocol?: number };
	blockedMessage?: string;
	reconnectTimer?: ReturnType<typeof setTimeout>;
	disposed: boolean;
	connect: () => void;
	onMismatch: (peerVersion: string) => void;
	onCompatible: () => void;
};
