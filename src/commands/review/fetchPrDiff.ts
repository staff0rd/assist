import { execSync } from "node:child_process";
import { getRepoInfo } from "../prs/shared";

export function fetchPrDiff(
	prNumber: number,
	baseSha: string,
	headSha: string,
): string {
	const { org, repo } = getRepoInfo();
	try {
		return execSync(`gh pr diff ${prNumber} -R ${org}/${repo}`, {
			encoding: "utf-8",
			maxBuffer: 256 * 1024 * 1024,
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (error) {
		// GitHub rejects diffs for PRs over 300 files (HTTP 406 too_large)
		if (!isDiffTooLarge(error)) throw error;
		return fetchDiffViaGit(baseSha, headSha);
	}
}

function isDiffTooLarge(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.message.includes("too_large") ||
			error.message.includes("maximum number of files"))
	);
}

function fetchDiffViaGit(baseSha: string, headSha: string): string {
	try {
		execSync(`git fetch origin ${baseSha} ${headSha}`, { stdio: "ignore" });
	} catch {
		// shas may already be available locally; git diff below fails clearly if not
	}
	return execSync(`git diff ${baseSha}...${headSha}`, {
		encoding: "utf-8",
		maxBuffer: 256 * 1024 * 1024,
	});
}
