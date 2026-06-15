import { execSync } from "node:child_process";
import { getPreferredRemoteRepo } from "./getPreferredRemoteRepo";

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
	const preferred = getPreferredRemoteRepo();
	if (preferred) return preferred;
	const repoInfo = JSON.parse(
		execSync("gh repo view --json owner,name", { encoding: "utf-8" }),
	);
	return { org: repoInfo.owner.login, repo: repoInfo.name };
}

function getCurrentBranch(): string {
	return execSync("git rev-parse --abbrev-ref HEAD", {
		encoding: "utf-8",
	}).trim();
}

function viewCurrentPr<T>(fields: string): T {
	const { org, repo } = getRepoInfo();
	const branch = getCurrentBranch();
	return JSON.parse(
		execSync(`gh pr view ${branch} --json ${fields} -R ${org}/${repo}`, {
			encoding: "utf-8",
		}),
	);
}

export function getCurrentPrNumber(): number {
	try {
		return viewCurrentPr<{ number: number }>("number").number;
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			console.error("Error: No pull request found for the current branch.");
			process.exit(1);
		}
		throw error;
	}
}

export function getCurrentPr(): { number: number; body: string } {
	try {
		return viewCurrentPr<{ number: number; body: string }>("number,body");
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			console.error("Error: No pull request found for the current branch.");
			process.exit(1);
		}
		throw error;
	}
}

export function getCurrentPrNodeId(): string {
	try {
		return viewCurrentPr<{ id: string }>("id").id;
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			console.error("Error: No pull request found for the current branch.");
			process.exit(1);
		}
		throw error;
	}
}

export function findCurrentPrNumber(): number | null {
	try {
		return viewCurrentPr<{ number: number }>("number").number;
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			return null;
		}
		throw error;
	}
}
