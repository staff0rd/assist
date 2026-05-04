import chalk from "chalk";

export function assertUniqueName(existingNames: string[], name: string): void {
	if (existingNames.includes(name)) {
		console.error(chalk.red(`Connection "${name}" already exists.`));
		process.exit(1);
	}
}
