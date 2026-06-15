import pkg from "../../../../package.json";

export const ASSIST_VERSION: string = pkg.version;

type Hello = { type: "hello"; version: string };

export function buildHello(): Hello {
	return { type: "hello", version: ASSIST_VERSION };
}

export function isHello(msg: Record<string, unknown>): msg is Hello {
	return msg.type === "hello" && typeof msg.version === "string";
}

export function versionsMatch(a: string, b: string): boolean {
	return a === b;
}
