import { describeFetchError } from "./describeFetchError";
import { fetchRepoPullRequests } from "./fetchRepoPullRequests";
import { parseRepoArgument } from "./parseRepoArgument";
import { toPrStatus } from "./toPrStatus";
import type { PrsStatusReport } from "./types";

export function buildPrsStatusReport(
	repoArguments: string[],
	now: number = Date.now(),
): PrsStatusReport {
	const report: PrsStatusReport = { repos: [], errors: [] };

	for (const argument of repoArguments) {
		const parsed = parseRepoArgument(argument);
		if (!parsed) {
			report.errors.push({
				repo: argument,
				error: "not an owner/repo argument",
			});
			continue;
		}

		const repo = `${parsed.org}/${parsed.repo}`;
		try {
			const pullRequests = fetchRepoPullRequests(parsed.org, parsed.repo).map(
				(pr) => toPrStatus(pr, now),
			);
			report.repos.push({ repo, pullRequests });
		} catch (error) {
			report.errors.push({ repo, error: describeFetchError(error) });
		}
	}

	return report;
}
