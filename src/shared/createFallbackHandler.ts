import type { IncomingMessage, ServerResponse } from "node:http";
import { createRouteHandler, type Handler, parseRoute } from "./web";

export function createFallbackHandler(
	routes: Record<string, Handler>,
	htmlHandler: Handler,
	extra?: (
		req: IncomingMessage,
		res: ServerResponse,
		pathname: string,
	) => Promise<boolean>,
): (req: IncomingMessage, res: ServerResponse, port: number) => Promise<void> {
	const baseHandler = createRouteHandler(routes);
	return async (req, res, port) => {
		const { method, pathname } = parseRoute(req, port);

		if (extra && (await extra(req, res, pathname))) return;

		if (routes[`${method} ${pathname}`]) {
			await baseHandler(req, res, port);
			return;
		}

		if (method === "GET" && !pathname.startsWith("/api/")) {
			await htmlHandler(req, res);
			return;
		}

		await baseHandler(req, res, port);
	};
}
