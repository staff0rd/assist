import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import * as diff from "diff";
import enquirer from "enquirer";

export async function syncSettings(
	claudeDir: string,
	targetBase: string,
): Promise<void> {
	const source = path.join(claudeDir, "settings.json");
	const target = path.join(targetBase, "settings.json");
	const sourceContent = fs.readFileSync(source, "utf-8");

	if (fs.existsSync(target)) {
		const targetContent = fs.readFileSync(target, "utf-8");
		if (sourceContent !== targetContent) {
			console.log(
				chalk.yellow("\n⚠️  Warning: settings.json differs from existing file"),
			);
			console.log();
			printDiff(targetContent, sourceContent);

			const { confirm } = await enquirer.prompt<{ confirm: boolean }>({
				type: "confirm",
				name: "confirm",
				message: chalk.red("Overwrite existing settings.json?"),
				initial: false,
			});

			if (!confirm) {
				console.log("Skipped settings.json");
				return;
			}
		}
	}

	fs.copyFileSync(source, target);
	console.log("Copied settings.json to ~/.claude/settings.json");
}

function printDiff(oldContent: string, newContent: string): void {
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
