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
	from,
}: {
	slug: string;
	jira?: string;
	from?: string;
}): Promise<{ branchName: string; baseRef: string }> {
	const config = loadConfig();
	const branchName = buildBranchName({
		prefix: config.branch?.prefix,
		jira,
		slug,
	});
	execSync("git fetch", { stdio: "inherit" });

	let baseRef: string;
	if (from) {
		try {
			execSync(`git rev-parse --verify ${shellQuote(from)}`, {
				stdio: ["pipe", "pipe", "pipe"],
			});
		} catch {
			throw new Error(`Ref "${from}" does not resolve to a valid git ref`);
		}
		baseRef = from;
	} else {
		baseRef = `origin/${resolveDefaultBranch(config.branch?.defaultBranch)}`;
	}

	execSync(`git switch -c ${shellQuote(branchName)} ${shellQuote(baseRef)}`, {
		stdio: "inherit",
	});
	await recordBranchActivity(branchName);
	return { branchName, baseRef };
}

async function recordBranchActivity(branchName: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	await recordSessionRefs([
		{ kind: "branch", ref: branchName, url: gitRefUrl("branch", branchName) },
	]);
}
