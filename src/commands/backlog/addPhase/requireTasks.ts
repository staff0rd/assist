import chalk from "chalk";

/** The `--task` values, or undefined after reporting that none were given. */
export function requireTasks(
	tasks: string[] | undefined,
): string[] | undefined {
	if (tasks && tasks.length > 0) return tasks;
	console.log(chalk.red("At least one --task is required."));
	process.exitCode = 1;
	return undefined;
}
