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

const baseHandler = createRouteHandler(routes);

export async function handleRequest(
	req: IncomingMessage,
	res: ServerResponse,
	port: number,
): Promise<void> {
	const url = new URL(req.url ?? "/", `http://localhost:${port}`);
	const method = req.method ?? "GET";
	const pathname = url.pathname;

	const itemMatch = pathname.match(/^\/api\/items\/(\d+)$/);
	if (itemMatch) {
		const itemHandler = itemRoutes[method];
		if (itemHandler) {
			await itemHandler(req, res, Number.parseInt(itemMatch[1], 10));
			return;
		}
	}

	await baseHandler(req, res, port);
}
