import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { printDiff } from "../../utils/printDiff";

export async function syncSettings(
	claudeDir: string,
	targetBase: string,
	options?: { yes?: boolean },
): Promise<void> {
	const source = path.join(claudeDir, "settings.json");
	const target = path.join(targetBase, "settings.json");
	const sourceContent = fs.readFileSync(source, "utf-8");
	const normalizedSource = JSON.stringify(JSON.parse(sourceContent), null, 2);

	if (fs.existsSync(target)) {
		const targetContent = fs.readFileSync(target, "utf-8");
		const normalizedTarget = JSON.stringify(JSON.parse(targetContent), null, 2);
		if (normalizedSource !== normalizedTarget) {
			if (!options?.yes) {
				console.log(
					chalk.yellow(
						"\n⚠️  Warning: settings.json differs from existing file",
					),
				);
				console.log();
				printDiff(targetContent, sourceContent);

				const confirm = await promptConfirm(
					chalk.red("Overwrite existing settings.json?"),
					false,
				);

				if (!confirm) {
					console.log("Skipped settings.json");
					return;
				}
			}
		}
	}

	fs.copyFileSync(source, target);
	console.log("Copied settings.json to ~/.claude/settings.json");
}
