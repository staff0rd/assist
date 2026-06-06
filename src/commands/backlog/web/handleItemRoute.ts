import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { rewindItemPhase } from "./rewindItemPhase";
import {
	deleteItem,
	deleteItemComment,
	getItemById,
	patchItemStatus,
} from "./shared";
import { updateItem } from "./updateItem";

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
		applyCwdFromReq(req);
		await rewindItemPhase(req, res, Number.parseInt(rewindMatch[1], 10));
		return true;
	}

	const commentMatch = pathname.match(/^\/api\/items\/(\d+)\/comments\/(\d+)$/);
	if (commentMatch && req.method === "DELETE") {
		applyCwdFromReq(req);
		await deleteItemComment(
			res,
			Number.parseInt(commentMatch[1], 10),
			Number.parseInt(commentMatch[2], 10),
		);
		return true;
	}

	const match = pathname.match(/^\/api\/items\/(\d+)$/);
	if (!match) return false;
	const handler = itemRoutes[req.method ?? "GET"];
	if (!handler) return false;
	applyCwdFromReq(req);
	await handler(req, res, Number.parseInt(match[1], 10));
	return true;
}
