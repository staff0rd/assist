import { existsSync, readFileSync } from "node:fs";
import { handledReviewsPath } from "./handledReviewsPath";

export function loadLocalHandledReviewIds(
	org: string,
	repo: string,
	prNumber: number,
): Set<number> {
	const path = handledReviewsPath(org, repo, prNumber);
	if (!existsSync(path)) return new Set();
	try {
		const ids: unknown = JSON.parse(readFileSync(path, "utf8"));
		return new Set(
			Array.isArray(ids) ? ids.filter((id) => Number.isInteger(id)) : [],
		);
	} catch {
		return new Set();
	}
}
