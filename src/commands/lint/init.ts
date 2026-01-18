import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import enquirer from "enquirer";
import { removeEslint } from "../../shared/removeEslint";
import { printDiff } from "../../utils/printDiff";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function init(): Promise<void> {
	removeEslint();

	const biomeConfigPath = "biome.json";

	if (!existsSync(biomeConfigPath)) {
		console.log("Initializing Biome...");
		execSync("npx @biomejs/biome init", { stdio: "inherit" });
	}

	if (!existsSync(biomeConfigPath)) {
		console.log("No biome.json found, skipping linter config");
		return;
	}

	const linterConfigPath = join(__dirname, "commands/lint/biome.linter.json");
	const linterConfig = JSON.parse(readFileSync(linterConfigPath, "utf-8"));
	const biomeConfig = JSON.parse(readFileSync(biomeConfigPath, "utf-8"));

	const oldContent = `${JSON.stringify(biomeConfig, null, 2)}\n`;
	biomeConfig.linter = linterConfig.linter;
	if (linterConfig.overrides) {
		biomeConfig.overrides = linterConfig.overrides;
	}
	const newContent = `${JSON.stringify(biomeConfig, null, 2)}\n`;

	if (oldContent === newContent) {
		console.log("biome.json already has the correct linter config");
		return;
	}

	console.log(chalk.yellow("\n⚠️  biome.json will be updated:"));
	console.log();
	printDiff(oldContent, newContent);

	const { confirm } = await enquirer.prompt<{ confirm: boolean }>({
		type: "confirm",
		name: "confirm",
		message: chalk.red("Update biome.json?"),
		initial: true,
	});

	if (!confirm) {
		console.log("Skipped biome.json update");
		return;
	}

	writeFileSync(biomeConfigPath, newContent);
	console.log("Updated biome.json with linter config");
}
