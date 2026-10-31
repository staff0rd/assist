import type { SessionClient } from "../broadcast";
import type { LaunchCircuitBreaker } from "../LaunchCircuitBreaker";
import type { PinRelay } from "../pins/PinRelay";
import type { LinkRelayState } from "./LinkRelayState";
import type { LinkSocket, LinkTransport } from "./LinkTransport";
import type { LinkSpec, LinkState } from "./LinkStatus";

export type NodeLinkDeps = {
	viewers: () => Set<SessionClient>;
	onSessionsChanged: () => void;
	onStateChanged: () => void;
	onHistoryChanged: () => void;
	pins: PinRelay;
	transport: LinkTransport;
	reconnectMs: number;
	blockedRetryMs: number;
	createTimeoutMs: number;
};

export type LinkContext = {
	spec: LinkSpec;
	deps: NodeLinkDeps;
	relay: LinkRelayState;
	breaker: LaunchCircuitBreaker;
	socket: LinkSocket | null;
	greeted: boolean;
	state: LinkState;
	lastError?: { message: string; at: string };
	peer?: { version: string; protocol?: number };
	protocol?: number;
	blockedMessage?: string;
	reconnectTimer?: ReturnType<typeof setTimeout>;
	disposed: boolean;
	connect: () => void;
};
