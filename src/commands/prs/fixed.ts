import { execFileSync } from "node:child_process";
import { loadConfig } from "../../shared/loadConfig";
import { pushCommit } from "../commit/pushCommit";
import { azureDevopsRemote } from "../review/azureDevopsRemote";
import { azureDevopsRepoUrl } from "./azureDevops/azureDevopsRepoUrl";
import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { getRepoInfo, isGhNotInstalled } from "./shared";
import { threadTarget } from "./threadTarget";

function verifySha(sha: string): string {
	try {
		return execFileSync("git", ["rev-parse", "--verify", sha], {
			encoding: "utf8",
		}).trim();
	} catch {
		console.error(`Error: '${sha}' is not a valid commit in this repository.`);
		process.exit(1);
	}
}

function repoUrl(): string {
	const azure = azureDevopsRemote(process.cwd());
	if (azure) return azureDevopsRepoUrl(azure);
	const { org, repo } = getRepoInfo();
	return `https://github.com/${org}/${repo}`;
}

export function fixed(commentId: number, sha: string): void {
	try {
		const fullSha = verifySha(sha);
		const message = `Fixed in [${fullSha}](${repoUrl()}/commit/${fullSha})`;

		pushCommit(loadConfig().worktree?.trunk === true);
		resolveCommentWithReply(threadTarget("fixed"), commentId, message);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
