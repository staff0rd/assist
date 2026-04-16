import type { IncomingMessage, ServerResponse } from "node:http";
import { rewindItemPhase } from "./rewindItemPhase";
import { deleteItem, getItemById, patchItemStatus, updateItem } from "./shared";

type ItemHandler = (
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
) => void | Promise<void>;

const itemRoutes: Record<string, ItemHandler> = {
	GET: (_req, res, id) => getItemById(res, id),
	PUT: (req, res, id) => updateItem(req, res, id),
	PATCH: (req, res, id) => patchItemStatus(req, res, id),
	DELETE: (_req, res, id) => deleteItem(res, id),
};

export async function handleItemRoute(
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
