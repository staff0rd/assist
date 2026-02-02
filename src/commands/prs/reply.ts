import { execSync } from "node:child_process";
import {
	getCurrentPrNumber,
	getRepoInfo,
	isGhNotInstalled,
	isNotFound,
} from "./shared";

function validateMessage(message: string): void {
	const lowerMessage = message.toLowerCase();
	if (lowerMessage.includes("claude") || lowerMessage.includes("opus")) {
		console.error('Error: Reply message must not contain "claude" or "opus"');
		process.exit(1);
	}
}

export function reply(commentId: number, message: string): void {
	validateMessage(message);

	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/comments/${commentId}/replies -f body="${message.replace(/"/g, '\\"')}"`,
			{ stdio: "inherit" },
		);
		console.log("Reply posted successfully.");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		if (isNotFound(error)) {
			console.error("Error: Pull request or comment not found.");
			process.exit(1);
		}
		throw error;
	}
}
