import { readFileSync } from "node:fs";
import { promptConfirm } from "../../shared/promptConfirm";
import { findCurrentPrNumber } from "../prs/shared";
import { parseFindings } from "./parseFindings";
import { partitionFindings } from "./partitionFindings";
import { postAndMaybeSubmit } from "./postAndMaybeSubmit";
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
	const prNumber = findCurrentPrNumber();
	if (prNumber === null) {
		console.log("No PR found for current branch; nothing posted.");
		return;
	}
	const markdown = readFileSync(synthesisPath, "utf-8");
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
	console.log(
		`Found PR #${prNumber} with ${lineBound.length} line-bound finding(s).`,
	);
	const confirmed = await confirmPost(prNumber, lineBound.length, options);
	if (!confirmed) {
		console.log("Skipped posting.");
		return;
	}
	await postAndMaybeSubmit(lineBound, markdown, options);
}
