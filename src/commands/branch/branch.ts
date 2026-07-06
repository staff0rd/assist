import { execSync } from "node:child_process";
import { loadConfig } from "../../shared/loadConfig";
import { shellQuote } from "../../shared/shellQuote";
import { buildBranchName } from "./buildBranchName";
import { resolveDefaultBranch } from "./resolveDefaultBranch";
import { validateSlug } from "./validateSlug";

export function branch(slug: string, options: { jira?: string }): void {
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
		process.exit(0);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}
