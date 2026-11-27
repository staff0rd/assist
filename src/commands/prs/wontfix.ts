import { cachedCommentUrl } from "./cachedCommentUrl";
import { rejectHarnessNames } from "./rejectHarnessNames";
import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { isGhNotInstalled } from "./shared";
import { threadTarget } from "./threadTarget";
import { validateShaReferences } from "./validateShaReferences";

export async function wontfix(
	commentId: number,
	reason: string,
): Promise<void> {
	rejectHarnessNames("Reason", reason);
	validateShaReferences(reason);

	try {
		const target = threadTarget("wontFix");
		const reference = `#${commentId}`;
		const url = cachedCommentUrl(target, commentId);
		await reviewProposedPrComment(
			`Won't fix comment ${reference}`,
			reason,
			null,
			url ? { reference, url } : undefined,
		);
		resolveCommentWithReply(target, commentId, reason);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
