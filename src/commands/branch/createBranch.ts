import { execFileSync, execSync } from "node:child_process";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { gitRefUrl } from "../../shared/gitRefUrl";
import { loadConfig } from "../../shared/loadConfig";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { buildBranchName } from "./buildBranchName";
import { freeBranchName } from "./freeBranchName";
import { resolveDefaultBranch } from "./resolveDefaultBranch";

export async function createBranch({
	slug,
	jira,
	from,
	unique,
}: {
	slug: string;
	jira?: string;
	from?: string;
	unique?: boolean;
}): Promise<{ branchName: string; baseRef: string }> {
	const config = loadConfig();
	const generatedName = buildBranchName({
		prefix: config.branch?.prefix,
		jira,
		slug,
	});
	execSync("git fetch", { stdio: "inherit" });
	const branchName = unique ? freeBranchName(generatedName) : generatedName;

	let baseRef: string;
	if (from) {
		try {
			execFileSync("git", ["rev-parse", "--verify", from], {
				stdio: ["pipe", "pipe", "pipe"],
			});
		} catch {
			throw new Error(`Ref "${from}" does not resolve to a valid git ref`);
		}
		baseRef = from;
	} else {
		baseRef = `origin/${resolveDefaultBranch(config.branch?.defaultBranch)}`;
	}

	execFileSync("git", ["switch", "-c", branchName, baseRef], {
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
