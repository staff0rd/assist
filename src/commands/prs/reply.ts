import { rejectHarnessAttribution } from "../../shared/rejectHarnessAttribution";
import { azureDevopsRemote } from "../review/azureDevopsRemote";
import { azureDevopsThreadActions } from "./azureDevops/azureDevopsThreadActions";
import { replyToComment } from "./replyToComment";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { getCurrentPrNumber, getRepoInfo, isGhNotInstalled } from "./shared";

function validateBody(body: string): void {
	const lowerBody = body.toLowerCase();
	if (lowerBody.includes("claude") || lowerBody.includes("opus")) {
		console.error('Error: Body must not contain "claude" or "opus"');
		process.exit(1);
	}
	rejectHarnessAttribution("Body", body);
}

export async function reply(commentId: number, body: string): Promise<void> {
	validateBody(body);

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
