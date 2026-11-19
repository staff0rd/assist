import { azureDevopsRemote } from "../review/azureDevopsRemote";
import { azureDevopsThreadActions } from "./azureDevops/azureDevopsThreadActions";
import { replyToComment } from "./replyToComment";
import { rejectHarnessNames } from "./rejectHarnessNames";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { getCurrentPrNumber, getRepoInfo, isGhNotInstalled } from "./shared";

export async function reply(commentId: number, body: string): Promise<void> {
	rejectHarnessNames("Body", body);

	await reviewProposedPrComment(`Reply to comment #${commentId}`, body, null);

	const azure = azureDevopsRemote(process.cwd());
	if (azure) {
		const pr = azureDevopsThreadActions.currentPr(azure);
		azureDevopsThreadActions.reply(pr, commentId, body);
		console.log("Reply posted successfully.");
		return;
	}

	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();

		replyToComment(org, repo, prNumber, commentId, body);
		console.log("Reply posted successfully.");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
