import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
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
			console.log(chalk.dim("\n--- Current ~/.claude/settings.json ---"));
			console.log(targetContent);
			console.log(chalk.dim("\n--- New settings.json ---"));
			console.log(sourceContent);

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
