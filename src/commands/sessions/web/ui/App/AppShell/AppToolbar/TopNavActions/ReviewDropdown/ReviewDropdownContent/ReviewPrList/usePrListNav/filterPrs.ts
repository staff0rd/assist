import type { PrSummary } from "../../../../../../../../../prList";

export function filterPrs(prs: PrSummary[], query: string): PrSummary[] {
	const term = query.trim().toLowerCase();
	if (!term) return prs;
	return prs.filter(
		(pr) =>
			pr.title.toLowerCase().includes(term) ||
			pr.author.toLowerCase().includes(term),
	);
}
