import { postReviewToPr } from "./postReviewToPr";
import { runRefineSession } from "./runRefineSession";

type PostSynthesisOptions = {
	refine: boolean;
	prompt: boolean;
	submit: boolean;
};

export async function handlePostSynthesis(
	synthesisPath: string,
	options: PostSynthesisOptions,
): Promise<void> {
	if (options.refine) {
		await runRefineSession(synthesisPath);
		return;
	}
	await postReviewToPr(synthesisPath, {
		prompt: options.prompt,
		submit: options.submit,
	});
}
