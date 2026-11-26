import { execFileSync, execSync } from "node:child_process";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { gitRefUrl } from "../../shared/gitRefUrl";
import { loadConfig } from "../../shared/loadConfig";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { buildBranchName } from "./buildBranchName";
import { freeBranchName } from "./freeBranchName";
import { resolveBranchBase } from "./resolveBranchBase";

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

	const { baseRef, pushRef } = from
		? { baseRef: verifiedRef(from) }
		: resolveBranchBase(config.branch?.defaultBranch);

	execFileSync(
		"git",
		["switch", "-c", branchName, ...(pushRef ? ["--no-track"] : []), baseRef],
		{ stdio: "inherit" },
	);
	if (pushRef) keepPushesOnOrigin(pushRef);
	await recordBranchActivity(branchName);
	return { branchName, baseRef };
}

function verifiedRef(from: string): string {
	try {
		execFileSync("git", ["rev-parse", "--verify", from], {
			stdio: ["pipe", "pipe", "pipe"],
		});
	} catch {
		throw new Error(`Ref "${from}" does not resolve to a valid git ref`);
	}
	return from;
}

function keepPushesOnOrigin(pushRef: string): void {
	try {
		execFileSync("git", ["branch", "--set-upstream-to", pushRef], {
			stdio: "ignore",
		});
	} catch {}
}

async function recordBranchActivity(branchName: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	await recordSessionRefs([
		{ kind: "branch", ref: branchName, url: gitRefUrl("branch", branchName) },
	]);
}
