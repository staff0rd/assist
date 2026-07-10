import type { IncomingMessage, ServerResponse } from "node:http";
import { parseItemId } from "../formatItemId";
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

const itemId = (match: RegExpMatchArray, group = 1): number =>
	parseItemId(match[group]);
const subId = (match: RegExpMatchArray, group: number): number =>
	Number.parseInt(match[group], 10);

const routes: ItemRoute[] = [
	{
		pattern: /^\/api\/items\/(a?\d+)\/rewind$/,
		method: "POST",
		run: (req, res, m) => rewindItemPhase(req, res, itemId(m)),
	},
	{
		pattern: /^\/api\/items\/(a?\d+)\/star$/,
		method: "POST",
		run: (req, res, m) => patchItemStar(req, res, itemId(m)),
	},
	{
		pattern: /^\/api\/items\/(a?\d+)\/comments\/(\d+)$/,
		method: "DELETE",
		run: (_req, res, m) => deleteItemComment(res, itemId(m), subId(m, 2)),
	},
	{
		pattern: /^\/api\/items\/(a?\d+)\/subtasks\/(\d+)$/,
		method: "PATCH",
		run: (req, res, m) => patchSubtaskStatus(req, res, itemId(m), subId(m, 2)),
	},
	{
		pattern: /^\/api\/items\/(a?\d+)$/,
		method: "GET",
		run: (_req, res, m) => getItemById(res, itemId(m)),
	},
	{
		pattern: /^\/api\/items\/(a?\d+)$/,
		method: "PATCH",
		run: (req, res, m) => patchItemStatus(req, res, itemId(m)),
	},
	{
		pattern: /^\/api\/items\/(a?\d+)$/,
		method: "DELETE",
		run: (_req, res, m) => deleteItem(res, itemId(m)),
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
