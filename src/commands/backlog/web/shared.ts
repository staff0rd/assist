import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getNextId } from "../getNextId";
import {
	getBacklogDir,
	loadBacklog,
	saveBacklog,
	searchBacklog,
} from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { findItemOr404 } from "./findItemOr404";
import { parseItemBody, parseStatusBody } from "./parseItemBody";

export function listItems(req: IncomingMessage, res: ServerResponse): void {
	applyCwdFromReq(req);
	const url = new URL(req.url ?? "/", "http://localhost");
	const q = url.searchParams.get("q");
	const items = q ? searchBacklog(q) : loadBacklog();
	console.log(
		"[backlog server] listItems → dir:",
		getBacklogDir(),
		"count:",
		items.length,
	);
	respondJson(res, 200, items);
}

export function getItemById(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): void {
	applyCwdFromReq(req);
	const result = findItemOr404(res, id);
	if (result) respondJson(res, 200, result.item);
}

export async function createItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await parseItemBody(req);
	applyCwdFromReq(req);
	const items = loadBacklog();
	const newItem = {
		id: getNextId(items),
		type: body.type ?? ("story" as const),
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
		status: "todo" as const,
	};
	items.push(newItem);
	saveBacklog(items);
	respondJson(res, 201, newItem);
}

export function deleteItem(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): void {
	applyCwdFromReq(req);
	const result = findItemOr404(res, id);
	if (!result) return;
	saveBacklog(result.items.filter((i) => i.id !== id));
	respondJson(res, 200, result.item);
}

export async function patchItemStatus(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const { status } = await parseStatusBody(req);
	applyCwdFromReq(req);
	const result = findItemOr404(res, id);
	if (!result) return;
	result.item.status = status;
	saveBacklog(result.items);
	respondJson(res, 200, result.item);
}
