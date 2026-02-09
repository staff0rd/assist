import { execSync } from "node:child_process";
import { isGhNotInstalled } from "../shared";
import type { PrsOptions, PullRequest } from "../types";
import { displayPaginated } from "./displayPaginated";

export async function prs(options: PrsOptions): Promise<void> {
	const state = options.open ? "open" : options.closed ? "closed" : "all";

	try {
		const result = execSync(
			`gh pr list --state ${state} --json number,title,url,author,createdAt,mergedAt,closedAt,state,changedFiles --limit 100`,
			{ encoding: "utf-8" },
		);

		const pullRequests: PullRequest[] = JSON.parse(result);

		if (pullRequests.length === 0) {
			console.log(
				`No ${state === "all" ? "" : `${state} `}pull requests found.`,
			);
			return;
		}

		await displayPaginated(pullRequests);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			return;
		}
		throw error;
	}
}
