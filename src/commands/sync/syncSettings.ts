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

	const sourceContent = fs.readFileSync(source, "utf8");
	const sourceSettings = JSON.parse(sourceContent);

	const targetExists = fs.existsSync(target);
	const targetContent = targetExists ? fs.readFileSync(target, "utf8") : "";
	const preservedUserSettings = targetExists ? JSON.parse(targetContent) : {};

	const mergedContent = JSON.stringify(
		{ ...preservedUserSettings, ...sourceSettings },
		null,
		"\t",
	);

	if (targetExists) {
		const normalizedTarget = JSON.stringify(preservedUserSettings, null, "\t");
		if (mergedContent !== normalizedTarget) {
			if (!options?.yes) {
				console.log(
					chalk.yellow(
						"\n⚠️  Warning: settings.json differs from existing file",
					),
				);
				console.log();
				printDiff(targetContent, mergedContent);

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

	fs.writeFileSync(target, mergedContent);
	console.log("Copied settings.json to ~/.claude/settings.json");
}
