import chalk from "chalk";
import * as diff from "diff";

export function printDiff(oldContent: string, newContent: string): void {
	const changes = diff.diffLines(oldContent, newContent);

	for (const change of changes) {
		const lines = change.value.replace(/\n$/, "").split("\n");
		for (const line of lines) {
			if (change.added) {
				console.log(chalk.green(`+ ${line}`));
			} else if (change.removed) {
				console.log(chalk.red(`- ${line}`));
			} else {
				console.log(chalk.dim(`  ${line}`));
			}
		}
	}
}
