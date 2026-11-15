import chalk from "chalk";

export function landingFailed(message: string): void {
	console.log(chalk.red(message));
	process.exitCode = 1;
}
