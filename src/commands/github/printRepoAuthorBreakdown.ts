import chalk from "chalk";
import type { AuthorCommitCount } from "./fetchRepoCommitAuthors";

type RepoAuthors = { name: string; authors: AuthorCommitCount[] };

export function printRepoAuthorBreakdown(repos: RepoAuthors[]): void {
	for (const repo of repos) {
		console.log(chalk.bold(repo.name));
		const authorWidth = Math.max(
			0,
			...repo.authors.map((a) => a.author.length),
		);
		for (const { author, commitCount } of repo.authors) {
			console.log(`  ${author.padEnd(authorWidth)}  ${commitCount}`);
		}
		console.log();
	}
}
