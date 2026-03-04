import { existsSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { buildTree, collectAllDeps } from "./buildTree";
import { findContainingSolutions } from "./findContainingSolutions";
import { findRepoRoot } from "./findRepoRoot";
import { printJson, printTree } from "./printTree";

export async function deps(
	csprojPath: string,
	options: { json?: boolean },
): Promise<void> {
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

	const tree = buildTree(resolved, repoRoot);
	const totalCount = collectAllDeps(tree).size + 1;
	const solutions = findContainingSolutions(resolved, repoRoot);

	if (options.json) {
		printJson(tree, totalCount, solutions);
	} else {
		printTree(tree, totalCount, solutions);
	}
}
