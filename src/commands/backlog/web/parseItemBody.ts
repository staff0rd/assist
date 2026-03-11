import type { IncomingMessage } from "node:http";

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
