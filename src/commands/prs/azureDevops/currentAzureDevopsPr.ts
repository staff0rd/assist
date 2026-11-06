import { execFileSync } from "node:child_process";
import type { AzureDevopsRepo } from "../../../shared/azureDevops/parseAzureDevopsRemote";
import { getCurrentBranch } from "../shared";
import type { AzureDevopsPrRef } from "./azureDevopsThreadRequests";

function findPrForBranch(repo: AzureDevopsRepo, branch: string): number {
	const stdout = execFileSync(
		"az",
		[
			"repos",
			"pr",
			"list",
			"--source-branch",
			branch,
			"--status",
			"active",
			"--org",
			`https://dev.azure.com/${repo.org}`,
			"--project",
			repo.project,
			"--repository",
			repo.repo,
			"--query",
			"[0].pullRequestId",
			"--only-show-errors",
			"-o",
			"tsv",
		],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
	);
	return Number.parseInt(stdout.trim(), 10);
}

export function currentAzureDevopsPr(repo: AzureDevopsRepo): AzureDevopsPrRef {
	const prId = findPrForBranch(repo, getCurrentBranch());
	if (Number.isNaN(prId)) {
		console.error("Error: No pull request found for the current branch.");
		process.exit(1);
	}
	return { ...repo, prId };
}
