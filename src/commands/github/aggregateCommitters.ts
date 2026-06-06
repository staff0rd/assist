import type { AuthorCommitCount } from "./fetchRepoCommitAuthors";

export function aggregateCommitters(
	authorLists: AuthorCommitCount[][],
): AuthorCommitCount[] {
	const totals = new Map<string, number>();
	for (const authors of authorLists) {
		for (const { author, commitCount } of authors) {
			totals.set(author, (totals.get(author) ?? 0) + commitCount);
		}
	}
	return [...totals]
		.map(([author, commitCount]) => ({ author, commitCount }))
		.sort((a, b) => b.commitCount - a.commitCount);
}
