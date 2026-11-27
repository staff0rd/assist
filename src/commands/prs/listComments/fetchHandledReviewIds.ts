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
	return parseHandledReviewIds(comments.map((c) => c.body ?? ""));
}
