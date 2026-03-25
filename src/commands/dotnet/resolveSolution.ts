import { existsSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { findSolution } from "./findSolution";

export function resolveSolution(sln: string | undefined): string {
	if (sln) {
		const resolved = path.resolve(sln);
		if (!existsSync(resolved)) {
			console.error(chalk.red(`Solution file not found: ${resolved}`));
			process.exit(1);
		}
		return resolved;
	}
	return findSolution();
}
