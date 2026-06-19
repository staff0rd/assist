import { replyToComment } from "./replyToComment";
import { getCurrentPrNumber, getRepoInfo, isGhNotInstalled } from "./shared";

function validateBody(body: string): void {
	const lowerBody = body.toLowerCase();
	if (lowerBody.includes("claude") || lowerBody.includes("opus")) {
		console.error('Error: Body must not contain "claude" or "opus"');
		process.exit(1);
	}
}

export function reply(commentId: number, body: string): void {
	validateBody(body);

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
