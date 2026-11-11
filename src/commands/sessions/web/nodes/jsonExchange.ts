import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

export function jsonExchange(body: unknown) {
	const raw = typeof body === "string" ? body : JSON.stringify(body);
	const req = Readable.from([Buffer.from(raw)]) as unknown as IncomingMessage;
	const sent: { status?: number; body?: unknown } = {};
	const res = {
		writeHead: (status: number) => {
			sent.status = status;
		},
		end: (text: string) => {
			sent.body = JSON.parse(text);
		},
	} as unknown as ServerResponse;
	return { req, res, sent };
}
