import { promptConfirm } from "../../shared/promptConfirm";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { carriedUnanchoredFindings } from "./carriedUnanchoredFindings";
import type { LineBoundFinding, UnanchoredFinding } from "./partitionFindings";
import { postFindings } from "./postFindings";
import { buildReviewBody } from "./buildReviewBody";
import { submitReview } from "./submitReview";
import { withRejectedFindings } from "./withRejectedFindings";

type PostAndMaybeSubmitOptions = {
	prompt: boolean;
	submit: boolean;
};

export type PostOutcome = {
	posted: number;
	submitted: boolean;
};

async function decideSubmit(
	options: PostAndMaybeSubmitOptions,
): Promise<boolean> {
	if (!options.prompt) return options.submit;
	await setSessionStatus("waiting");
	try {
		return await promptConfirm("Submit the pending review?", options.submit);
	} finally {
		await setSessionStatus("running");
	}
}

export async function postAndMaybeSubmit(
	lineBound: LineBoundFinding[],
	unanchored: UnanchoredFinding[],
	markdown: string,
	options: PostAndMaybeSubmitOptions,
): Promise<PostOutcome> {
	const { posted, failed } = await postFindings(lineBound);
	const failedSuffix = failed.length > 0 ? `, ${failed.length} failed` : "";
	console.log(`Posted ${posted} comment(s)${failedSuffix}.`);
	const withRejected = withRejectedFindings(unanchored, failed);
	const carried = carriedUnanchoredFindings(withRejected);
	if (posted === 0 && carried.length === 0)
		return { posted: 0, submitted: false };
	const shouldSubmit = await decideSubmit(options);
	if (shouldSubmit) {
		const submitted = submitReview(buildReviewBody(markdown, withRejected), {
			posted,
			failed: failed.length,
		});
		return { posted, submitted };
	}
	console.log("Leaving the review unsubmitted.");
	return { posted, submitted: false };
}
