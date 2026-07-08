import { execSync } from "node:child_process";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { gitRefUrl } from "../../shared/gitRefUrl";
import { loadConfig } from "../../shared/loadConfig";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { shellQuote } from "../../shared/shellQuote";
import { buildBranchName } from "./buildBranchName";
import { resolveDefaultBranch } from "./resolveDefaultBranch";
import { validateSlug } from "./validateSlug";

export async function branch(
	slug: string,
	options: { jira?: string },
): Promise<void> {
	const slugError = validateSlug(slug);
	if (slugError) {
		console.error(`Error: ${slugError}`);
		process.exit(1);
	}

	const config = loadConfig();
	const branchName = buildBranchName({
		prefix: config.branch?.prefix,
		jira: options.jira,
		slug,
	});

	try {
		const defaultBranch = resolveDefaultBranch(config.branch?.defaultBranch);
		execSync("git fetch", { stdio: "inherit" });
		execSync(
			`git switch -c ${shellQuote(branchName)} ${shellQuote(`origin/${defaultBranch}`)}`,
			{ stdio: "inherit" },
		);
		console.log(
			`Created and switched to ${branchName} (from origin/${defaultBranch})`,
		);
		await recordBranchActivity(branchName);
		process.exit(0);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}

async function recordBranchActivity(branchName: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	await recordSessionRefs([
		{ kind: "branch", ref: branchName, url: gitRefUrl("branch", branchName) },
	]);
}
