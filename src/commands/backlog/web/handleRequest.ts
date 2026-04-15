import type { IncomingMessage, ServerResponse } from "node:http";
import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import {
	createBundleHandler,
	createHtmlHandler,
	type Handler,
} from "../../../shared/web";
import { getHtml } from "./getHtml";
import { rewindItemPhase } from "./rewindItemPhase";
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

const htmlHandler = createHtmlHandler(getHtml);

const routes: Record<string, Handler> = {
	"GET /": htmlHandler,
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

async function handleItemRoute(
	req: IncomingMessage,
	res: ServerResponse,
	pathname: string,
): Promise<boolean> {
	const rewindMatch = pathname.match(/^\/api\/items\/(\d+)\/rewind$/);
	if (rewindMatch && req.method === "POST") {
		await rewindItemPhase(req, res, Number.parseInt(rewindMatch[1], 10));
		return true;
	}

	const match = pathname.match(/^\/api\/items\/(\d+)$/);
	if (!match) return false;
	const handler = itemRoutes[req.method ?? "GET"];
	if (!handler) return false;
	await handler(req, res, Number.parseInt(match[1], 10));
	return true;
}

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleItemRoute,
);
