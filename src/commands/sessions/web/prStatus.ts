import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { createCachedGhJson } from "./createCachedGhJson";
import { getCwdParam } from "./getCwdParam";
import type { PrSummary } from "./prList";

type GhPr = {
	number?: number;
	title?: string;
	author?: { login?: string; name?: string };
	createdAt?: string;
	url?: string;
};

const getPr = createCachedGhJson<PrSummary | null>(
	["pr", "view", "--json", "number,title,author,createdAt,url"],
	(stdout) => {
		const parsed = JSON.parse(stdout) as GhPr;
		if (typeof parsed.number !== "number") return null;
		return {
			number: parsed.number,
			title: parsed.title ?? "",
			author: parsed.author?.name || parsed.author?.login || "unknown",
			createdAt: parsed.createdAt ?? "",
			url: parsed.url ?? "",
		};
	},
	null,
);

export async function prStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	respondJson(res, 200, { pr: await getPr(cwd) });
}
