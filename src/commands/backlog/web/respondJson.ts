import type { IncomingMessage, ServerResponse } from "node:http";

export function respondJson(
	res: ServerResponse,
	status: number,
	data: unknown,
): void {
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

type ItemBody = {
	type?: "story" | "bug";
	name: string;
	description?: string;
	acceptanceCriteria?: string[];
};

export async function parseItemBody(req: IncomingMessage): Promise<ItemBody> {
	return JSON.parse(await readBody(req)) as ItemBody;
}
