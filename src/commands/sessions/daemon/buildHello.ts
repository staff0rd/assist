import pkg from "../../../../package.json";
import { resolveNodeName } from "../shared/resolveNodeName";

export const ASSIST_VERSION: string = pkg.version;

export const PROTOCOL_VERSION = 2;

type Hello = {
	type: "hello";
	version: string;
	protocol?: number;
	nodeName?: string;
	peer?: boolean;
};

export function buildHello(extra: { peer?: boolean } = {}): Hello {
	return {
		type: "hello",
		version: ASSIST_VERSION,
		protocol: PROTOCOL_VERSION,
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

export function helloCompatible(msg: Hello): boolean {
	if (protocolMismatched(msg)) return false;
	return msg.version === ASSIST_VERSION;
}

export function helloMismatchKind(msg: Hello): "protocol" | "version" {
	return protocolMismatched(msg) ? "protocol" : "version";
}

function protocolMismatched(msg: Hello): boolean {
	return typeof msg.protocol === "number" && msg.protocol !== PROTOCOL_VERSION;
}
