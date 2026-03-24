import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";

function findSlnInDir(dir: string): string[] {
	try {
		return readdirSync(dir)
			.filter((f) => f.endsWith(".sln"))
			.map((f) => join(dir, f));
	} catch {
		return [];
	}
}

export function findSolution(): string {
	const repoRoot = findRepoRoot(process.cwd());
	const ceiling = repoRoot ?? process.cwd();

	let current = process.cwd();
	while (true) {
		const slnFiles = findSlnInDir(current);
		if (slnFiles.length === 1) return slnFiles[0];
		if (slnFiles.length > 1) {
			console.error(chalk.red(`Multiple .sln files found in ${current}:`));
			for (const f of slnFiles) console.error(`  ${f}`);
			console.error(
				chalk.yellow("Specify which one: assist dotnet inspect <sln>"),
			);
			process.exit(1);
		}
		if (current === ceiling) break;
		current = dirname(current);
	}

	console.error(chalk.red("No .sln file found between cwd and repo root"));
	process.exit(1);
}
