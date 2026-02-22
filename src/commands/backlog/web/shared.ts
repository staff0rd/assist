import type { IncomingMessage, ServerResponse } from "node:http";
import { getNextId, loadBacklog, saveBacklog } from "../shared";

function respondJson(res: ServerResponse, status: number, data: unknown): void {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk: Buffer) => {
			body += chunk.toString();
		});
		req.on("end", () => resolve(body));
		req.on("error", reject);
	});
}

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

type ItemBody = {
	name: string;
	description?: string;
	acceptanceCriteria?: string[];
};

async function parseItemBody(req: IncomingMessage): Promise<ItemBody> {
	return JSON.parse(await readBody(req)) as ItemBody;
}

export async function createItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await parseItemBody(req);
	const items = loadBacklog();
	const newItem = {
		id: getNextId(items),
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
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
	});
	saveBacklog(result.items);
	respondJson(res, 200, result.item);
}
