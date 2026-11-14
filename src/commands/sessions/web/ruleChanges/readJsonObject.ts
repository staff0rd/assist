import type { IncomingMessage } from "node:http";
import { readJsonBody } from "../readJsonBody";

type JsonObject = Record<string, unknown>;

export async function readJsonObject(
	req: IncomingMessage,
): Promise<JsonObject | undefined> {
	try {
		return ((await readJsonBody(req)) ?? undefined) as JsonObject | undefined;
	} catch {
		return undefined;
	}
}
