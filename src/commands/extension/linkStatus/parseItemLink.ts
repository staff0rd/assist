import type { LinkRef } from "../../sessions/web/linkStatus/LinkState";

const ITEM_URL =
	/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/(?:issues|pull)\/(\d+)\/?(?:[?#].*)?$/;

export function parseItemLink(href: string): LinkRef | null {
	const match = ITEM_URL.exec(href);
	if (!match) return null;
	return { owner: match[1], repo: match[2], number: Number(match[3]) };
}
