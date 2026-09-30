import { assignIssueToSelf } from "./assignIssueToSelf";
import { moveIssueToInProgress } from "./moveIssueToInProgress";
import { resolveIssueRepoTarget } from "./resolveIssueRepoTarget";

type StartIssueOptions = {
	repo?: string;
};

const USAGE = "Usage: assist github issue started <number> [-R <owner>/<repo>]";

export function startIssue(
	numberArg: string,
	options: StartIssueOptions,
): void {
	const number = Number.parseInt(numberArg, 10);
	if (!Number.isInteger(number) || number <= 0) {
		console.error(USAGE);
		process.exit(1);
	}

	const { owner, repo } = resolveIssueRepoTarget(options.repo);
	const slug = `${owner}/${repo}`;

	try {
		assignIssueToSelf(number, slug);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
	console.log(`Assigned ${slug}#${number} to you`);

	moveIssueToInProgress({ owner, repo, number });
}
