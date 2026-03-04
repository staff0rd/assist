import chalk from "chalk";
import { findContainingSolutions } from "./findContainingSolutions";
import { resolveCsproj } from "./resolveCsproj";

export async function inSln(csprojPath: string): Promise<void> {
	const { resolved, repoRoot } = resolveCsproj(csprojPath);

	const solutions = findContainingSolutions(resolved, repoRoot);

	if (solutions.length === 0) {
		console.log(chalk.yellow("Not found in any .sln file"));
		process.exit(1);
	}

	for (const sln of solutions) {
		console.log(sln);
	}
}
