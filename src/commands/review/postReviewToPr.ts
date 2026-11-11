import { readFileSync } from "node:fs";
import type { HarnessKind } from "../../shared/harnesses";
import { promptConfirm } from "../../shared/promptConfirm";
import { carriedUnanchoredFindings } from "./carriedUnanchoredFindings";
import { chainAfterReview } from "./chainAfterReview";
import { type PostOutcome, postAndMaybeSubmit } from "./postAndMaybeSubmit";
import { selectPostableFindings } from "./selectPostableFindings";
import { stillOnReviewedPr } from "./stillOnReviewedPr";
import { describeWork } from "./describeWork";

type PostReviewOptions = {
	prompt: boolean;
	submit: boolean;
	addressComments: boolean;
	announce: boolean;
	harness?: HarnessKind;
};

export type PrDiffRef = {
	prNumber: number;
	baseSha: string;
	headSha: string;
};

const NOTHING_POSTED: PostOutcome = { posted: 0, submitted: false };

async function confirmPost(
	prNumber: number,
	work: string,
	options: PostReviewOptions,
): Promise<boolean> {
	if (!options.prompt) return true;
	return promptConfirm(`Post ${work} to PR #${prNumber}?`, false);
}

async function postFindingsToPr(
	prInfo: PrDiffRef,
	synthesisPath: string,
	options: PostReviewOptions,
): Promise<PostOutcome> {
	const markdown = readFileSync(synthesisPath, "utf8");
	const { inDiff, unanchored } = selectPostableFindings(markdown, prInfo);
	const carried = carriedUnanchoredFindings(unanchored);
	if (inDiff.length === 0 && carried.length === 0) return NOTHING_POSTED;
	const work = describeWork(inDiff.length, carried.length);
	console.log(`Found PR #${prInfo.prNumber} with ${work} to post.`);
	const confirmed = await confirmPost(prInfo.prNumber, work, options);
	if (!confirmed) {
		console.log("Skipped posting.");
		return NOTHING_POSTED;
	}
	return postAndMaybeSubmit(inDiff, unanchored, markdown, options);
}

export async function postReviewToPr(
	synthesisPath: string,
	prInfo: PrDiffRef,
	options: PostReviewOptions,
): Promise<void> {
	if (!stillOnReviewedPr(prInfo.prNumber)) return;
	const outcome = await postFindingsToPr(prInfo, synthesisPath, options);
	await chainAfterReview(prInfo.prNumber, outcome, options);
}
