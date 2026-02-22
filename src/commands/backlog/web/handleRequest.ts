import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getHtml } from "./getHtml";
import {
	createItem,
	deleteItem,
	getItemById,
	listItems,
	updateItem,
} from "./shared";

const __dirname = dirname(fileURLToPath(import.meta.url));

let bundleCache: string | undefined;

function serveBundle(_req: IncomingMessage, res: ServerResponse): void {
	if (!bundleCache) {
		bundleCache = readFileSync(
			join(__dirname, "commands/backlog/web/bundle.js"),
			"utf-8",
		);
	}
	res.writeHead(200, { "Content-Type": "application/javascript" });
	res.end(bundleCache);
}

type Handler = (
	req: IncomingMessage,
	res: ServerResponse,
) => void | Promise<void>;

function serveHtml(_req: IncomingMessage, res: ServerResponse): void {
	res.writeHead(200, { "Content-Type": "text/html" });
	res.end(getHtml());
}

type ItemHandler = (
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
) => void | Promise<void>;

const routes: Record<string, Handler> = {
	"GET /": serveHtml,
	"GET /bundle.js": serveBundle,
	"GET /api/items": listItems,
	"POST /api/items": createItem,
};

const itemRoutes: Record<string, ItemHandler> = {
	GET: (_req, res, id) => getItemById(res, id),
	PUT: (req, res, id) => updateItem(req, res, id),
	DELETE: (_req, res, id) => deleteItem(res, id),
};

function parseRoute(req: IncomingMessage, port: number) {
	const url = new URL(req.url ?? "/", `http://localhost:${port}`);
	return { method: req.method ?? "GET", pathname: url.pathname };
}

export async function handleRequest(
	req: IncomingMessage,
	res: ServerResponse,
	port: number,
): Promise<void> {
	const { method, pathname } = parseRoute(req, port);

	const handler = routes[`${method} ${pathname}`];
	if (handler) {
		await handler(req, res);
		return;
	}

	const itemMatch = pathname.match(/^\/api\/items\/(\d+)$/);
	if (itemMatch) {
		const itemHandler = itemRoutes[method];
		if (itemHandler) {
			await itemHandler(req, res, Number.parseInt(itemMatch[1], 10));
			return;
		}
	}

	res.writeHead(404);
	res.end();
}
