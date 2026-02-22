import type { IncomingMessage, ServerResponse } from "node:http";
import { getNextId, loadBacklog, saveBacklog } from "../shared";
import { parseItemBody, respondJson } from "./respondJson";

export function listItems(_req: IncomingMessage, res: ServerResponse): void {
	respondJson(res, 200, loadBacklog());
}

function findItemOr404(res: ServerResponse, id: number) {
	const items = loadBacklog();
	const item = items.find((i) => i.id === id);
	if (!item) {
		respondJson(res, 404, { error: "Not found" });
		return undefined;
	}
	return { items, item };
}

export function getItemById(res: ServerResponse, id: number): void {
	const result = findItemOr404(res, id);
	if (result) respondJson(res, 200, result.item);
}

export async function createItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await parseItemBody(req);
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

export function deleteItem(res: ServerResponse, id: number): void {
	const result = findItemOr404(res, id);
	if (!result) return;
	saveBacklog(result.items.filter((i) => i.id !== id));
	respondJson(res, 200, result.item);
}

export async function updateItem(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const body = await parseItemBody(req);
	const result = findItemOr404(res, id);
	if (!result) return;
	Object.assign(result.item, {
		type: body.type ?? result.item.type,
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
	});
	saveBacklog(result.items);
	respondJson(res, 200, result.item);
}
