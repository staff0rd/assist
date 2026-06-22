import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { removeEslint } from "../../shared/removeEslint";
import { printDiff } from "../../utils/printDiff";
import oxlintTemplate from "./oxlintrc.template.json";

export async function init(): Promise<void> {
	removeEslint();
	await writeOxlintConfig();
}

async function writeOxlintConfig(): Promise<void> {
	const newContent = `${JSON.stringify(oxlintTemplate, null, "\t")}\n`;

	const configPath = ".oxlintrc.json";
	const oldContent = existsSync(configPath)
		? readFileSync(configPath, "utf8")
		: "";

	if (oldContent === newContent) {
		console.log(".oxlintrc.json already has the baseline linter config");
		return;
	}

	if (!oldContent) {
		writeFileSync(configPath, newContent);
		console.log("Created .oxlintrc.json with baseline linter config");
		return;
	}

	console.log(chalk.yellow("\n⚠️  .oxlintrc.json will be updated:"));
	console.log();
	printDiff(oldContent, newContent);

	const confirm = await promptConfirm(chalk.red("Update .oxlintrc.json?"));
	if (!confirm) {
		console.log("Skipped .oxlintrc.json update");
		return;
	}

	writeFileSync(configPath, newContent);
	console.log("Updated .oxlintrc.json with baseline linter config");
}
