import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { printDiff } from "../../utils/printDiff";
import { mergeSettings } from "./mergeSettings";
import { printAutoConfirmHint } from "./printAutoConfirmHint";
import { readSourceSettings } from "./readSourceSettings";

export async function syncSettings(
	claudeDir: string,
	targetBase: string,
	options?: { yes?: boolean; preferences?: boolean },
): Promise<void> {
	const target = path.join(targetBase, "settings.json");
	const sourceSettings = readSourceSettings(claudeDir, options?.preferences);

	const targetExists = fs.existsSync(target);
	const targetContent = targetExists ? fs.readFileSync(target, "utf8") : "";
	const preservedUserSettings = targetExists ? JSON.parse(targetContent) : {};

	const mergedContent = JSON.stringify(
		mergeSettings(preservedUserSettings, sourceSettings),
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
				printAutoConfirmHint();

				const confirm = await promptConfirm(
					chalk.red("Write merged settings.json?"),
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
	console.log("Merged settings.json into ~/.claude/settings.json");
}
