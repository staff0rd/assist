import pkg from "../../../../package.json";

export const ASSIST_VERSION: string = pkg.version;

export const PROTOCOL_VERSION = 2;

type Hello = { type: "hello"; version: string; protocol?: number };

export function buildHello(): Hello {
	return { type: "hello", version: ASSIST_VERSION, protocol: PROTOCOL_VERSION };
}

export function isHello(msg: Record<string, unknown>): msg is Hello {
	return (
		msg.type === "hello" &&
		typeof msg.version === "string" &&
		(msg.protocol === undefined || typeof msg.protocol === "number")
	);
}

export function helloCompatible(msg: Hello): boolean {
	if (typeof msg.protocol === "number")
		return msg.protocol === PROTOCOL_VERSION;
	return msg.version === ASSIST_VERSION;
}
