import type { IncomingMessage, ServerResponse } from "node:http";

type AsyncHandler = (
	req: IncomingMessage,
	res: ServerResponse,
	port: number,
) => Promise<void>;

// why: always log requests at least this slow so tab-switch latency degradation
// surfaces in the server's stdout without any opt-in.
const SLOW_REQUEST_MS = 1000;

function logRequest(
	method: string,
	url: string,
	status: number,
	ms: number,
): void {
	const slow = ms >= SLOW_REQUEST_MS;
	// why: ASSIST_WEB_LOG opts into logging every request, not just slow ones.
	if (!slow && !process.env.ASSIST_WEB_LOG) return;
	console.log(
		`${new Date().toISOString()} ${method} ${url} ${status} ${ms}ms${slow ? " SLOW" : ""}`,
	);
}

/**
 * Invoke an async request handler with per-request timing and error handling.
 * why: createServer ignores the returned promise, so an unhandled rejection
 * would leave the response hanging until the browser times out — the very
 * multi-second stall this instrumentation exists to catch.
 */
export function runHandler(
	handler: AsyncHandler,
	req: IncomingMessage,
	res: ServerResponse,
	port: number,
): void {
	const startedAt = Date.now();
	const method = req.method ?? "GET";
	const url = req.url ?? "/";
	res.on("finish", () => {
		logRequest(method, url, res.statusCode, Date.now() - startedAt);
	});
	Promise.resolve(handler(req, res, port)).catch((error) => {
		console.error(
			`${new Date().toISOString()} ${method} ${url} failed: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		if (!res.headersSent)
			res.writeHead(500, { "Content-Type": "application/json" });
		if (!res.writableEnded)
			res.end(JSON.stringify({ error: "internal error" }));
	});
}
