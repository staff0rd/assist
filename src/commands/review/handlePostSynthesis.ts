import { announcePr } from "./announcePr";
import { type PrDiffRef, postReviewToPr } from "./postReviewToPr";
import { runApplySession } from "./runApplySession";
import { runBacklogSession } from "./runBacklogSession";
import { runRefineSession } from "./runRefineSession";

type PostSynthesisOptions = {
	refine: boolean;
	apply: boolean;
	backlog: boolean;
	prompt: boolean;
	submit: boolean;
	addressComments: boolean;
	announce: boolean;
};

type SessionRunner = (synthesisPath: string) => Promise<void>;

function nonPostingSession(
	options: PostSynthesisOptions,
): SessionRunner | null {
	if (options.backlog) return runBacklogSession;
	if (options.apply) return runApplySession;
	if (options.refine) return runRefineSession;
	return null;
}

export async function handlePostSynthesis(
	synthesisPath: string,
	prInfo: PrDiffRef,
	options: PostSynthesisOptions,
): Promise<void> {
	const session = nonPostingSession(options);
	if (!session) {
		await postReviewToPr(synthesisPath, prInfo, {
			prompt: options.prompt,
			submit: options.submit,
			addressComments: options.addressComments,
			announce: options.announce,
		});
		return;
	}
	await session(synthesisPath);
	if (options.announce) await announcePr(prInfo.prNumber);
}
