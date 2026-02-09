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

export function getCurrentPrNumber(): number {
	try {
		const prInfo = JSON.parse(
			execSync("gh pr view --json number", { encoding: "utf-8" }),
		);
		return prInfo.number;
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			console.error("Error: No pull request found for the current branch.");
			process.exit(1);
		}
		throw error;
	}
}
