import { execFileSync } from "node:child_process";
import { currentPrSelector } from "./currentPrSelector";
import type { BaseRepoMode } from "./resolveBaseRepo";
import { getBaseRepoInfo } from "./getBaseRepoInfo";
import { getCurrentBranch } from "./shared";

export function enableAutoMerge(baseRepo?: BaseRepoMode): void {
	try {
		const { org, repo } = getBaseRepoInfo(baseRepo);
		const selector = currentPrSelector(getCurrentBranch(), org);
		execFileSync(
			"gh",
			["pr", "merge", selector, "--auto", "--squash", "-R", `${org}/${repo}`],
			{ stdio: "inherit" },
		);
	} catch (error) {
		console.error(
			`Warning: could not enable auto-merge: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
