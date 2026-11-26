import { getRepoInfo } from "../../prs/shared";
import { ghPrView } from "../highLevel/ghPrView";
import { exitWithError } from "./exitWithError";

export function resolvePrHead(pr: string): {
	number: number;
	sha: string;
	headRef: string;
	repo: string;
	fullName: string;
} {
	const number = Number(pr);
	if (!Number.isInteger(number) || number <= 0)
		exitWithError(`\`${pr}\` is not a pull request number.`);
	const repo = getRepoInfo();
	const { headRefOid, headRefName } = ghPrView<{
		headRefOid: string;
		headRefName: string;
	}>(number, repo, "headRefOid,headRefName");
	return {
		number,
		sha: headRefOid,
		headRef: headRefName,
		repo: repo.repo,
		fullName: `${repo.org}/${repo.repo}`,
	};
}
