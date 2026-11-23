import type { PrSummary } from "./prList";

export type GhPr = {
	number?: number;
	title?: string;
	author?: { login?: string; name?: string };
	createdAt?: string;
	url?: string;
	isDraft?: boolean;
};

export const prFields = "number,title,author,createdAt,url,isDraft";

export function toPrSummary(parsed: GhPr): PrSummary | null {
	if (typeof parsed.number !== "number") return null;
	return {
		number: parsed.number,
		title: parsed.title ?? "",
		author: parsed.author?.name || parsed.author?.login || "unknown",
		createdAt: parsed.createdAt ?? "",
		url: parsed.url ?? "",
		isDraft: parsed.isDraft === true,
	};
}
