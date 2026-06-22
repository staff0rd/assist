import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { printDiff } from "../../utils/printDiff";
import oxfmtTemplate from "./oxfmtrc.template.json";

export async function init(): Promise<void> {
	const newContent = `${JSON.stringify(oxfmtTemplate, null, "\t")}\n`;

	const configPath = ".oxfmtrc.json";
	const oldContent = existsSync(configPath)
		? readFileSync(configPath, "utf8")
		: "";

	if (oldContent === newContent) {
		console.log(".oxfmtrc.json already has the baseline formatter config");
		return;
	}

	if (!oldContent) {
		writeFileSync(configPath, newContent);
		console.log("Created .oxfmtrc.json with baseline formatter config");
		return;
	}

	console.log(chalk.yellow("\n⚠️  .oxfmtrc.json will be updated:"));
	console.log();
	printDiff(oldContent, newContent);

	const confirm = await promptConfirm(chalk.red("Update .oxfmtrc.json?"));
	if (!confirm) {
		console.log("Skipped .oxfmtrc.json update");
		return;
	}

	writeFileSync(configPath, newContent);
	console.log("Updated .oxfmtrc.json with baseline formatter config");
}
