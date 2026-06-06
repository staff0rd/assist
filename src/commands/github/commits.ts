import { aggregateCommitters } from "./aggregateCommitters";
import { fetchOrgRepoCommitCounts } from "./fetchOrgRepoCommitCounts";
import { fetchRepoCommitAuthors } from "./fetchRepoCommitAuthors";
import { type CommitsReport, printCommitsReport } from "./printCommitsReport";

type CommitsOptions = { since?: string; top?: number; json?: boolean };

export function commits(org: string, options: CommitsOptions): void {
	const since = options.since
		? `${options.since}T00:00:00Z`
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
	const sinceDate = since.slice(0, 10);

	const allRepos = fetchOrgRepoCommitCounts(org, since)
		.filter((repo) => repo.commitCount > 0)
		.sort((a, b) => b.commitCount - a.commitCount);
	const repos = options.top ? allRepos.slice(0, options.top) : allRepos;

	const repoAuthors = repos.map((repo) => ({
		name: repo.name,
		authors: fetchRepoCommitAuthors(org, repo.name, since),
	}));

	const report: CommitsReport = {
		org,
		since: sinceDate,
		totalRepos: allRepos.length,
		repos,
		committers: aggregateCommitters(repoAuthors.map((r) => r.authors)),
		repoAuthors,
	};

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
	} else if (repos.length === 0) {
		console.log(`No commits found in ${org} since ${sinceDate}.`);
	} else {
		printCommitsReport(report);
	}
}
