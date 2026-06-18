import { readFileSync } from "node:fs";
import { promptConfirm } from "../../shared/promptConfirm";
import { fetchPrDiffInfo } from "./fetchPrDiffInfo";
import { parseFindings } from "./parseFindings";
import { partitionFindings } from "./partitionFindings";
import { postAndMaybeSubmit } from "./postAndMaybeSubmit";
import { selectInDiffFindings } from "./selectInDiffFindings";
import { warnUnlocated } from "./warnUnlocated";

type PostReviewOptions = {
	prompt: boolean;
	submit: boolean;
};

async function confirmPost(
	prNumber: number,
	count: number,
	options: PostReviewOptions,
): Promise<boolean> {
	if (!options.prompt) return true;
	return promptConfirm(`Post ${count} comment(s) to PR #${prNumber}?`, false);
}

export async function postReviewToPr(
	synthesisPath: string,
	options: PostReviewOptions,
): Promise<void> {
	const prInfo = fetchPrDiffInfo();
	const prNumber = prInfo.prNumber;
	const markdown = readFileSync(synthesisPath, "utf8");
	const findings = parseFindings(markdown);
	if (findings.length === 0) {
		console.log("Synthesis contains no findings; nothing to post.");
		return;
	}
	const { lineBound, unlocated, alreadyRaised } = partitionFindings(findings);
	warnUnlocated(unlocated);
	if (alreadyRaised.length > 0) {
		console.log(
			`Skipped ${alreadyRaised.length} finding(s) already raised by prior comments.`,
		);
	}
	if (lineBound.length === 0) {
		console.log("No line-bound findings to post.");
		return;
	}
	const inDiff = selectInDiffFindings(lineBound, prInfo);
	if (inDiff.length === 0) {
		console.log("No findings fall within the PR diff; nothing to post.");
		return;
	}
	console.log(
		`Found PR #${prNumber} with ${inDiff.length} line-bound finding(s) in the diff.`,
	);
	const confirmed = await confirmPost(prNumber, inDiff.length, options);
	if (!confirmed) {
		console.log("Skipped posting.");
		return;
	}
	await postAndMaybeSubmit(inDiff, markdown, options);
}
