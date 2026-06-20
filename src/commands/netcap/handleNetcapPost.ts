import { appendFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { corsHeaders } from "./corsHeaders";
import { parseNetcapEntry } from "./parseNetcapEntry";
import type { NetcapHandlerOptions } from "./types";

export function handleNetcapPost(
	req: IncomingMessage,
	res: ServerResponse,
	options: NetcapHandlerOptions,
): void {
	let body = "";
	req.on("data", (chunk) => {
		body += chunk;
	});
	req.on("end", () => {
		const entry = parseNetcapEntry(body);
		if (!entry) {
			res.writeHead(400, corsHeaders);
			res.end();
			return;
		}
		void appendFile(options.outPath, `${JSON.stringify(entry)}\n`)
			.then(() => {
				options.onCapture?.(entry);
				res.writeHead(200, {
					...corsHeaders,
					"Content-Type": "application/json",
				});
				res.end(JSON.stringify({ ok: true }));
			})
			.catch((error: unknown) => {
				res.writeHead(500, corsHeaders);
				res.end(String(error));
			});
	});
}
