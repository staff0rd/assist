import chalk from "chalk";

export function failRule(message: string): void {
	console.error(chalk.red(message));
	process.exitCode = 1;
}
