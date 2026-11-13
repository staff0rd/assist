import { parseAzureDevopsPrUrl } from "../../../../shared/azureDevops/parseAzureDevopsPrUrl";

const githubPrUrl = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/;

export function remotePrGuidance(url: string): string | undefined {
	const githubPr = url.match(githubPrUrl)?.[0];
	if (githubPr)
		return `This is a pull request. Read it remotely with \`gh pr view ${githubPr} --comments\` and \`gh pr diff ${githubPr}\`; do not check out its branch.`;
	const pr = parseAzureDevopsPrUrl(url);
	if (!pr) return undefined;
	const org = `https://dev.azure.com/${encodeURIComponent(pr.org)}`;
	return `This is an Azure DevOps pull request. Read it remotely with \`az repos pr show --id ${pr.id} --org ${org}\` and its comment threads with \`az devops invoke --area git --resource pullRequestThreads --route-parameters "project=${pr.project}" "repositoryId=${pr.repo}" pullRequestId=${pr.id} --org ${org}\`; diff it with \`git fetch origin refs/pull/${pr.id}/merge\` then \`git diff FETCH_HEAD^1 FETCH_HEAD\`. Do not check out its branch.`;
}
