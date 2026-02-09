import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { getRepoInfo, isGhNotInstalled } from "./shared";

export function fixed(commentId: number, sha: string): void {
	try {
		const { org, repo } = getRepoInfo();
		const repoUrl = `https://github.com/${org}/${repo}`;
		const message = `Fixed in [${sha}](${repoUrl}/commit/${sha})`;

		resolveCommentWithReply(commentId, message);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
