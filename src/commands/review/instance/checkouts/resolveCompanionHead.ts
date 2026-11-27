import type { CompanionHead, CompanionLookup } from "./CompanionHead";
import { findLinkedPr } from "./findLinkedPr";
import { parseRemoteHead } from "./parseRemoteHead";

export function resolveCompanionHead(
	repoRoot: string,
	repo: { org: string; repo: string },
	prBody: string,
	lookup: CompanionLookup,
): CompanionHead {
	const fullName = `${repo.org}/${repo.repo}`;
	const linked = findLinkedPr(prBody, fullName);
	if (linked !== null)
		return {
			sha: lookup.prHead(linked, repo),
			fetchRef: `pull/${linked}/head`,
			source: `linked PR #${linked}`,
		};
	const head = parseRemoteHead(lookup.remoteHead(repoRoot));
	if (!head)
		throw new Error(
			`Could not resolve the default branch of ${fullName} from origin in ${repoRoot}`,
		);
	return {
		sha: head.sha,
		fetchRef: `refs/heads/${head.branch}`,
		source: `default branch ${head.branch}`,
	};
}
