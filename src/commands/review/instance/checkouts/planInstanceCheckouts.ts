import { expandTilde } from "../../../../shared/expandTilde";
import { basename, resolve } from "node:path";
import type { InstanceServices } from "../InstanceConfig";
import type { CompanionLookup } from "./CompanionHead";
import type { InstanceCheckout } from "./InstanceCheckout";
import { resolveCompanionHead } from "./resolveCompanionHead";

type ReviewedPr = {
	fullName: string;
	number: number;
	sha: string;
	body: string;
};

type CheckoutsInput = {
	services: InstanceServices;
	repoRoot: string;
	pr: ReviewedPr;
	worktreeBase: string;
	lookup: CompanionLookup;
};

function servicesByRepoRoot(
	services: InstanceServices,
	repoRoot: string,
): Map<string, string[]> {
	const groups = new Map<string, string[]>([[repoRoot, []]]);
	for (const [service, { repo }] of Object.entries(services)) {
		const root = repo ? resolve(repoRoot, expandTilde(repo)) : repoRoot;
		groups.set(root, [...(groups.get(root) ?? []), service]);
	}
	return groups;
}

function companionCheckout(
	input: CheckoutsInput,
	root: string,
	services: string[],
): InstanceCheckout {
	const remote = input.lookup.remoteRepo(root);
	if (!remote)
		throw new Error(
			`review.instance.services.${services[0]}.repo (${root}) is not a clone with a GitHub remote`,
		);
	const repo = `${remote.org}/${remote.repo}`;
	const slug = basename(root)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-");
	return {
		repo,
		repoRoot: root,
		dir: `${input.worktreeBase}-${slug}`,
		services,
		...resolveCompanionHead(root, remote, input.pr.body, input.lookup),
	};
}

export function planInstanceCheckouts(
	input: CheckoutsInput,
): InstanceCheckout[] {
	const { pr, repoRoot } = input;
	return [...servicesByRepoRoot(input.services, repoRoot)].map(
		([root, services]) =>
			root === repoRoot
				? {
						repo: pr.fullName,
						repoRoot,
						dir: input.worktreeBase,
						sha: pr.sha,
						fetchRef: `pull/${pr.number}/head`,
						source: `PR #${pr.number}`,
						services,
					}
				: companionCheckout(input, root, services),
	);
}
