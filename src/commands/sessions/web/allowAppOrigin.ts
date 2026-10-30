import type { IncomingMessage, ServerResponse } from "node:http";
import { isAppOrigin } from "./isAppOrigin";

export function allowAppOrigin(
	req: IncomingMessage,
	res: ServerResponse,
	pathname: string,
): boolean {
	const origin = req.headers.origin;
	if (!pathname.startsWith("/api/") || !isAppOrigin(origin)) return false;
	res.setHeader("Access-Control-Allow-Origin", origin as string);
	res.setHeader("Vary", "Origin");
	if (req.method !== "OPTIONS") return false;
	res.setHeader("Access-Control-Allow-Methods", "GET, POST");
	res.setHeader(
		"Access-Control-Allow-Headers",
		req.headers["access-control-request-headers"] ?? "Content-Type",
	);
	res.setHeader("Access-Control-Max-Age", "600");
	console.log(`app cors: preflight ${pathname} from ${origin}`);
	res.writeHead(204);
	res.end();
	return true;
}
