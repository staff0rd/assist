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

export function getItemById(res: ServerResponse, id: number): void {
	const items = loadBacklog();
	const item = items.find((i) => i.id === id);
	if (!item) {
		respondJson(res, 404, { error: "Not found" });
		return;
	}
	respondJson(res, 200, item);
}

export async function createItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = JSON.parse(await readBody(req)) as {
		name: string;
		description?: string;
		acceptanceCriteria?: string[];
	};
	const items = loadBacklog();
	const id = getNextId(items);
	const newItem = {
		id,
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
		status: "todo" as const,
	};
	items.push(newItem);
	saveBacklog(items);
	respondJson(res, 201, newItem);
}

export async function updateItem(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const body = JSON.parse(await readBody(req)) as {
		name: string;
		description?: string;
		acceptanceCriteria?: string[];
	};
	const items = loadBacklog();
	const item = items.find((i) => i.id === id);
	if (!item) {
		respondJson(res, 404, { error: "Not found" });
		return;
	}
	item.name = body.name;
	item.description = body.description;
	item.acceptanceCriteria = body.acceptanceCriteria ?? [];
	saveBacklog(items);
	respondJson(res, 200, item);
}
