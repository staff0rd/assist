import chalk from "chalk";
import * as diff from "diff";

function normalizeJson(content: string): string {
	try {
		return JSON.stringify(JSON.parse(content), null, 2);
	} catch {
		return content;
	}
}

export function printDiff(oldContent: string, newContent: string): void {
	const changes = diff.diffLines(
		normalizeJson(oldContent),
		normalizeJson(newContent),
	);

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
