import type { AuthorCommitCount } from "./fetchRepoCommitAuthors";
import { printCountTable } from "./printCountTable";
import { printRepoAuthorBreakdown } from "./printRepoAuthorBreakdown";

export type CommitsReport = {
	org: string;
	since: string;
	totalRepos: number;
	repos: { name: string; commitCount: number }[];
	committers: AuthorCommitCount[];
	repoAuthors: { name: string; authors: AuthorCommitCount[] }[];
};

export function printCommitsReport(report: CommitsReport): void {
	const { org, since, totalRepos, repos, committers, repoAuthors } = report;
	const scope =
		repos.length < totalRepos
			? ` (top ${repos.length} of ${totalRepos} repos)`
			: "";

	console.log(`Top repos by commits in ${org} since ${since}${scope}:\n`);
	printCountTable(
		"Repo",
		repos.map((r) => ({ label: r.name, count: r.commitCount })),
	);

	console.log(`\nTop committers in ${org} since ${since}${scope}:\n`);
	printCountTable(
		"Committer",
		committers.map((c) => ({ label: c.author, count: c.commitCount })),
	);

	console.log("\nCommits by author per repo:\n");
	printRepoAuthorBreakdown(repoAuthors);
}
