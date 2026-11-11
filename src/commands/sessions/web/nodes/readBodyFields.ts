import type { IncomingMessage } from "node:http";
import { readJsonBody } from "../readJsonBody";

export async function readBodyFields<K extends string>(
	req: IncomingMessage,
	keys: readonly K[],
): Promise<Record<K, string> | null> {
	let body: Record<string, unknown>;
	try {
		body = ((await readJsonBody(req)) ?? {}) as Record<string, unknown>;
	} catch {
		return null;
	}
	const fields = {} as Record<K, string>;
	for (const key of keys) {
		const value = body[key];
		if (typeof value !== "string" || !value.trim()) return null;
		fields[key] = value.trim();
	}
	return fields;
}
