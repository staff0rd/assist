import { execSync } from "node:child_process";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { gitRefUrl } from "../../shared/gitRefUrl";
import { loadConfig } from "../../shared/loadConfig";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { shellQuote } from "../../shared/shellQuote";
import { buildBranchName } from "./buildBranchName";
import { resolveDefaultBranch } from "./resolveDefaultBranch";

export async function createBranch({
	slug,
	jira,
}: {
	slug: string;
	jira?: string;
}): Promise<{ branchName: string; defaultBranch: string }> {
	const config = loadConfig();
	const branchName = buildBranchName({
		prefix: config.branch?.prefix,
		jira,
		slug,
	});
	const defaultBranch = resolveDefaultBranch(config.branch?.defaultBranch);
	execSync("git fetch", { stdio: "inherit" });
	execSync(
		`git switch -c ${shellQuote(branchName)} ${shellQuote(`origin/${defaultBranch}`)}`,
		{ stdio: "inherit" },
	);
	await recordBranchActivity(branchName);
	return { branchName, defaultBranch };
}

async function recordBranchActivity(branchName: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	await recordSessionRefs([
		{ kind: "branch", ref: branchName, url: gitRefUrl("branch", branchName) },
	]);
}
