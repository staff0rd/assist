import { rejectHarnessNames } from "./rejectHarnessNames";
import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { isGhNotInstalled } from "./shared";
import { validateShaReferences } from "./validateShaReferences";

export async function wontfix(
	commentId: number,
	reason: string,
): Promise<void> {
	rejectHarnessNames("Reason", reason);
	validateShaReferences(reason);

	await reviewProposedPrComment(
		`Won't fix comment #${commentId}`,
		reason,
		null,
	);

	try {
		resolveCommentWithReply(commentId, reason, "wontFix");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
