import { execSync } from "node:child_process";

export function isGhNotInstalled(error: unknown): boolean {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return msg.includes("enoent") || msg.includes("command not found");
	}
	return false;
}

export function isNotFound(error: unknown): boolean {
	if (error instanceof Error) {
		return error.message.includes("HTTP 404");
	}
	return false;
}

export function getRepoInfo(): { org: string; repo: string } {
	const repoInfo = JSON.parse(
		execSync("gh repo view --json owner,name", { encoding: "utf-8" }),
	);
	return { org: repoInfo.owner.login, repo: repoInfo.name };
}
