import { execSync } from "node:child_process";
import fs from "node:fs";
import chalk from "chalk";

const REFACTOR_YML_PATH = "refactor.yml";

function getCurrentCommit(): string {
	return execSync("git log -1 --format='%h'", { encoding: "utf-8" }).trim();
}

export function ignore(file: string, options: { reason: string }): void {
	if (!options.reason) {
		console.error(chalk.red("Error: --reason is required"));
		process.exit(1);
	}

	if (!fs.existsSync(file)) {
		console.error(chalk.red(`Error: File does not exist: ${file}`));
		process.exit(1);
	}

	const commit = getCurrentCommit();
	const entry = `- file: ${file}\n  commit: ${commit}\n  reason: ${options.reason}\n`;

	if (fs.existsSync(REFACTOR_YML_PATH)) {
		const existing = fs.readFileSync(REFACTOR_YML_PATH, "utf-8");
		fs.writeFileSync(REFACTOR_YML_PATH, existing + entry);
	} else {
		fs.writeFileSync(REFACTOR_YML_PATH, entry);
	}

	console.log(chalk.green(`Added ${file} to refactor ignore list`));
}
