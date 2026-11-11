import type { LinkRef } from "./LinkState";

export function linkRefKey({ owner, repo, number }: LinkRef): string {
	return `${owner}/${repo}#${number}`.toLowerCase();
}
