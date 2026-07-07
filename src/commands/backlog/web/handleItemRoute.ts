import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { deleteItemComment } from "./deleteItemComment";
import { patchSubtaskStatus } from "./patchSubtaskStatus";
import { rewindItemPhase } from "./rewindItemPhase";
import {
	deleteItem,
	getItemById,
	patchItemStar,
	patchItemStatus,
} from "./shared";

type RouteHandler = (
	req: IncomingMessage,
	res: ServerResponse,
	match: RegExpMatchArray,
) => void | Promise<void>;

type ItemRoute = { pattern: RegExp; method: string; run: RouteHandler };

const id = (match: RegExpMatchArray, group = 1): number =>
	Number.parseInt(match[group], 10);

const routes: ItemRoute[] = [
	{
		pattern: /^\/api\/items\/(\d+)\/rewind$/,
		method: "POST",
		run: (req, res, m) => rewindItemPhase(req, res, id(m)),
	},
	{
		pattern: /^\/api\/items\/(\d+)\/star$/,
		method: "POST",
		run: (req, res, m) => patchItemStar(req, res, id(m)),
	},
	{
		pattern: /^\/api\/items\/(\d+)\/comments\/(\d+)$/,
		method: "DELETE",
		run: (_req, res, m) => deleteItemComment(res, id(m), id(m, 2)),
	},
	{
		pattern: /^\/api\/items\/(\d+)\/subtasks\/(\d+)$/,
		method: "PATCH",
		run: (req, res, m) => patchSubtaskStatus(req, res, id(m), id(m, 2)),
	},
	{
		pattern: /^\/api\/items\/(\d+)$/,
		method: "GET",
		run: (_req, res, m) => getItemById(res, id(m)),
	},
	{
		pattern: /^\/api\/items\/(\d+)$/,
		method: "PATCH",
		run: (req, res, m) => patchItemStatus(req, res, id(m)),
	},
	{
		pattern: /^\/api\/items\/(\d+)$/,
		method: "DELETE",
		run: (_req, res, m) => deleteItem(res, id(m)),
	},
];

export async function handleItemRoute(
	req: IncomingMessage,
	res: ServerResponse,
	pathname: string,
): Promise<boolean> {
	for (const route of routes) {
		const match = pathname.match(route.pattern);
		if (match && req.method === route.method) {
			applyCwdFromReq(req);
			await route.run(req, res, match);
			return true;
		}
	}
	return false;
}
