import { loadLocalHandledReviewIds } from "../loadLocalHandledReviewIds";
import { parseHandledReviewIds } from "../parseHandledReviewIds";
import { fetchJson } from "./fetchJson";

export function fetchHandledReviewIds(
	org: string,
	repo: string,
	prNumber: number,
): Set<number> {
	const comments = fetchJson(
		`repos/${org}/${repo}/issues/${prNumber}/comments`,
	) as { body?: string | null }[];
	return new Set([
		...parseHandledReviewIds(comments.map((c) => c.body ?? "")),
		...loadLocalHandledReviewIds(org, repo, prNumber),
	]);
}
