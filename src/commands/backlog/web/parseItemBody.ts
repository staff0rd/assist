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

type StatusBody = {
	status: "todo" | "in-progress" | "done" | "wontdo";
};

export async function parseItemBody(req: IncomingMessage): Promise<ItemBody> {
	return JSON.parse(await readBody(req)) as ItemBody;
}

export async function parseStatusBody(
	req: IncomingMessage,
): Promise<StatusBody> {
	return JSON.parse(await readBody(req)) as StatusBody;
}

type RewindBody = {
	phase: number;
	reason: string;
};

export async function parseRewindBody(
	req: IncomingMessage,
): Promise<RewindBody> {
	return JSON.parse(await readBody(req)) as RewindBody;
}

type StarBody = {
	starred: boolean;
};

export async function parseStarBody(req: IncomingMessage): Promise<StarBody> {
	return JSON.parse(await readBody(req)) as StarBody;
}
