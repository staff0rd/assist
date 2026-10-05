import pkg from "../../../../package.json";
import { resolveNodeName } from "../shared/resolveNodeName";

export const ASSIST_VERSION: string = pkg.version;

export const PROTOCOL_VERSION = 2;

export const MIN_PROTOCOL_VERSION = 1;

type Hello = {
	type: "hello";
	version: string;
	protocol?: number;
	minProtocol?: number;
	nodeName?: string;
	peer?: boolean;
};

export function buildHello(extra: { peer?: boolean } = {}): Hello {
	return {
		type: "hello",
		version: ASSIST_VERSION,
		protocol: PROTOCOL_VERSION,
		minProtocol: MIN_PROTOCOL_VERSION,
		nodeName: resolveNodeName(),
		...extra,
	};
}

export function isHello(msg: Record<string, unknown>): msg is Hello {
	return (
		msg.type === "hello" &&
		typeof msg.version === "string" &&
		(msg.protocol === undefined || typeof msg.protocol === "number")
	);
}

type ProtocolRange = { min: number; max: number };

function peerProtocolRange(msg: Hello): ProtocolRange | undefined {
	if (typeof msg.protocol !== "number") return undefined;
	const min =
		typeof msg.minProtocol === "number"
			? Math.min(msg.minProtocol, msg.protocol)
			: msg.protocol;
	return { min, max: msg.protocol };
}

export function negotiateProtocol(msg: Hello): number | undefined {
	const peer = peerProtocolRange(msg);
	if (!peer) return undefined;
	const common = Math.min(peer.max, PROTOCOL_VERSION);
	return common >= Math.max(peer.min, MIN_PROTOCOL_VERSION)
		? common
		: undefined;
}

function formatRange(range: ProtocolRange | undefined): string {
	if (!range) return "legacy (no protocol)";
	return range.min === range.max
		? `protocol ${range.max}`
		: `protocols ${range.min}–${range.max}`;
}

export function describeProtocolGap(node: string, msg: Hello): string {
	const peer = peerProtocolRange(msg);
	const local = { min: MIN_PROTOCOL_VERSION, max: PROTOCOL_VERSION };
	const behind = peer && peer.min > local.max ? "this node" : node;
	return `no common protocol: ${node} ${msg.version} speaks ${formatRange(peer)}, this node ${ASSIST_VERSION} speaks ${formatRange(local)}; update ${behind} and restart it when convenient — the link reconnects once the ranges overlap`;
}
