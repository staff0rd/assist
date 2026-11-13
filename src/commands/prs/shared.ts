import { execSync } from "node:child_process";
import { currentPrSelector } from "./currentPrSelector";
import { getPreferredRemoteRepo } from "./getPreferredRemoteRepo";

export function isGhNotInstalled(error: unknown): boolean {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return msg.includes("enoent") || msg.includes("command not found");
	}
	return false;
}

export function getRepoInfo(): { org: string; repo: string } {
	const preferred = getPreferredRemoteRepo();
	if (preferred) return preferred;
	const repoInfo = JSON.parse(
		execSync("gh repo view --json owner,name", { encoding: "utf8" }),
	);
	return { org: repoInfo.owner.login, repo: repoInfo.name };
}

export function getCurrentBranch(): string {
	return execSync("git rev-parse --abbrev-ref HEAD", {
		encoding: "utf8",
	}).trim();
}

function viewCurrentPr<T>(fields: string): T {
	const { org, repo } = getRepoInfo();
	const selector = currentPrSelector(getCurrentBranch(), org);
	return JSON.parse(
		execSync(`gh pr view ${selector} --json ${fields} -R ${org}/${repo}`, {
			encoding: "utf8",
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

export function getCurrentPr(): {
	number: number;
	title: string;
	body: string;
} {
	try {
		return viewCurrentPr<{ number: number; title: string; body: string }>(
			"number,title,body",
		);
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
	return findCurrentPr()?.number ?? null;
}

export function findCurrentPr(): {
	number: number;
	state: "OPEN" | "CLOSED" | "MERGED";
} | null {
	try {
		return viewCurrentPr("number,state");
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			return null;
		}
		throw error;
	}
}
