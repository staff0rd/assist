import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { createCachedGhJson } from "./createCachedGhJson";
import { getCwdParam } from "./getCwdParam";

export type PrSummary = {
	number: number;
	title: string;
	author: string;
	createdAt: string;
	url: string;
};

type GhPr = {
	number: number;
	title: string;
	author?: { login?: string; name?: string };
	createdAt: string;
	url: string;
};

const getOpenPrs = createCachedGhJson<PrSummary[]>(
	[
		"pr",
		"list",
		"--state",
		"open",
		"--json",
		"number,title,author,createdAt,url",
	],
	(stdout) => {
		const parsed = JSON.parse(stdout) as GhPr[];
		if (!Array.isArray(parsed)) return [];
		return parsed.map((pr) => ({
			number: pr.number,
			title: pr.title,
			author: pr.author?.name || pr.author?.login || "unknown",
			createdAt: pr.createdAt,
			url: pr.url,
		}));
	},
	[],
);

export async function prList(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	respondJson(res, 200, { prs: await getOpenPrs(cwd) });
}
