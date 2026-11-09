import type { HarnessKind } from "../../shared/harnesses";
import { announcePr } from "./announcePr";
import { postSynthesisSession } from "./postSynthesisSession";
import { type PrDiffRef, postReviewToPr } from "./postReviewToPr";
import { runReviewSession } from "./runReviewSession";

type PostSynthesisOptions = {
	refine: boolean;
	apply: boolean;
	backlog: boolean;
	prompt: boolean;
	submit: boolean;
	addressComments: boolean;
	announce: boolean;
	harness?: HarnessKind;
};

export async function handlePostSynthesis(
	synthesisPath: string,
	prInfo: PrDiffRef,
	options: PostSynthesisOptions,
): Promise<void> {
	const session = postSynthesisSession(options);
	if (!session) {
		await postReviewToPr(synthesisPath, prInfo, {
			prompt: options.prompt,
			submit: options.submit,
			addressComments: options.addressComments,
			announce: options.announce,
		});
		return;
	}
	await runReviewSession(session, synthesisPath, options.harness);
	if (options.announce) await announcePr(prInfo.prNumber);
}
