import { countUnresolvedThreads } from "./countUnresolvedThreads";
import { describeFetchError } from "./describeFetchError";
import { fetchRepoPullRequests } from "./fetchRepoPullRequests";
import { parseRepoArgument } from "./parseRepoArgument";
import { summarisePrsStatus } from "./summarisePrsStatus";
import { toPrStatus } from "./toPrStatus";
import type { PrsStatusReport, RepoStatus } from "./types";

export function buildPrsStatusReport(
	repoArguments: string[],
	now: number = Date.now(),
): PrsStatusReport {
	const repos: RepoStatus[] = [];
	const errors: PrsStatusReport["errors"] = [];

	for (const argument of repoArguments) {
		const parsed = parseRepoArgument(argument);
		if (!parsed) {
			errors.push({
				repo: argument,
				error: "not an owner/repo argument",
			});
			continue;
		}

		const repo = `${parsed.org}/${parsed.repo}`;
		try {
			const pullRequests = fetchRepoPullRequests(parsed.org, parsed.repo).map(
				(pr) =>
					toPrStatus(
						pr,
						countUnresolvedThreads(parsed.org, parsed.repo, pr.number),
						now,
					),
			);
			repos.push({ repo, pullRequests });
		} catch (error) {
			errors.push({ repo, error: describeFetchError(error) });
		}
	}

	return { repos, errors, summary: summarisePrsStatus(repos) };
}
