import { existsSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";

export function resolveCsproj(csprojPath: string): {
	resolved: string;
	repoRoot: string;
} {
	const resolved = path.resolve(csprojPath);
	if (!existsSync(resolved)) {
		console.error(chalk.red(`File not found: ${resolved}`));
		process.exit(1);
	}

	const repoRoot = findRepoRoot(path.dirname(resolved));
	if (!repoRoot) {
		console.error(chalk.red("Could not find git repository root"));
		process.exit(1);
	}

	return { resolved, repoRoot };
}
