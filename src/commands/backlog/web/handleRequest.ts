import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getHtml } from "./getHtml";
import { createItem, getItemById, listItems, updateItem } from "./shared";

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

const routes: Record<string, Handler> = {
	"GET /": serveHtml,
	"GET /bundle.js": serveBundle,
	"GET /api/items": listItems,
	"POST /api/items": createItem,
};

export async function handleRequest(
	req: IncomingMessage,
	res: ServerResponse,
	port: number,
): Promise<void> {
	const url = new URL(req.url ?? "/", `http://localhost:${port}`);
	const method = req.method ?? "GET";
	const key = `${method} ${url.pathname}`;

	const handler = routes[key];
	if (handler) {
		await handler(req, res);
		return;
	}

	const itemMatch = url.pathname.match(/^\/api\/items\/(\d+)$/);
	if (itemMatch) {
		const id = Number.parseInt(itemMatch[1], 10);
		if (method === "GET") {
			getItemById(res, id);
			return;
		}
		if (method === "PUT") {
			await updateItem(req, res, id);
			return;
		}
	}

	res.writeHead(404);
	res.end();
}
