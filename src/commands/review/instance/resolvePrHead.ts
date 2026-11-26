import { getRepoInfo } from "../../prs/shared";
import { ghPrView } from "../highLevel/ghPrView";
import { exitWithError } from "./exitWithError";

export function resolvePrHead(pr: string): {
	number: number;
	sha: string;
	repo: string;
} {
	const number = Number(pr);
	if (!Number.isInteger(number) || number <= 0)
		exitWithError(`\`${pr}\` is not a pull request number.`);
	const repo = getRepoInfo();
	const { headRefOid } = ghPrView<{ headRefOid: string }>(
		number,
		repo,
		"headRefOid",
	);
	return { number, sha: headRefOid, repo: repo.repo };
}
