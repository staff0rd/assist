import { execSync } from "node:child_process";
import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { getRepoInfo, isGhNotInstalled } from "./shared";

function verifySha(sha: string): string {
	try {
		return execSync(`git rev-parse --verify ${sha}`, {
			encoding: "utf-8",
		}).trim();
	} catch {
		console.error(`Error: '${sha}' is not a valid commit in this repository.`);
		process.exit(1);
	}
}

export function fixed(commentId: number, sha: string): void {
	try {
		const fullSha = verifySha(sha);
		const { org, repo } = getRepoInfo();
		const repoUrl = `https://github.com/${org}/${repo}`;
		const message = `Fixed in [${fullSha}](${repoUrl}/commit/${fullSha})`;

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
