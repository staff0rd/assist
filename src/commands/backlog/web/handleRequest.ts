import type { IncomingMessage, ServerResponse } from "node:http";
import {
	createBundleHandler,
	createHtmlHandler,
	createRouteHandler,
	type Handler,
} from "../../../shared/web";
import { getHtml } from "./getHtml";
import {
	createItem,
	deleteItem,
	getItemById,
	listItems,
	patchItemStatus,
	updateItem,
} from "./shared";

type ItemHandler = (
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
) => void | Promise<void>;

const routes: Record<string, Handler> = {
	"GET /": createHtmlHandler(getHtml),
	"GET /bundle.js": createBundleHandler(
		import.meta.url,
		"commands/backlog/web/bundle.js",
	),
	"GET /api/items": listItems,
	"POST /api/items": createItem,
};

const itemRoutes: Record<string, ItemHandler> = {
	GET: (_req, res, id) => getItemById(res, id),
	PUT: (req, res, id) => updateItem(req, res, id),
	PATCH: (req, res, id) => patchItemStatus(req, res, id),
	DELETE: (_req, res, id) => deleteItem(res, id),
};

const serveHtml = createHtmlHandler(getHtml);
const baseHandler = createRouteHandler(routes);

async function handleItemRoute(
	req: IncomingMessage,
	res: ServerResponse,
	pathname: string,
): Promise<boolean> {
	const match = pathname.match(/^\/api\/items\/(\d+)$/);
	if (!match) return false;
	const handler = itemRoutes[req.method ?? "GET"];
	if (!handler) return false;
	await handler(req, res, Number.parseInt(match[1], 10));
	return true;
}

export async function handleRequest(
	req: IncomingMessage,
	res: ServerResponse,
	port: number,
): Promise<void> {
	const url = new URL(req.url ?? "/", `http://localhost:${port}`);
	const method = req.method ?? "GET";
	const pathname = url.pathname;

	if (await handleItemRoute(req, res, pathname)) return;

	if (routes[`${method} ${pathname}`]) {
		await baseHandler(req, res, port);
		return;
	}

	// Client-side routing catch-all: serve HTML for non-API GET requests
	if (method === "GET" && !pathname.startsWith("/api/")) {
		await serveHtml(req, res);
		return;
	}

	await baseHandler(req, res, port);
}
