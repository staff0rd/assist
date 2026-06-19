import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { removeEslint } from "../../shared/removeEslint";
import { printDiff } from "../../utils/printDiff";
import oxlintTemplate from "./oxlintrc.template.json";

export async function init(): Promise<void> {
	removeEslint();
	await writeOxlintConfig();
	removeBiomeConfig();
	uninstallBiome();
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

function removeBiomeConfig(): void {
	for (const file of ["biome.json", "biome.jsonc"]) {
		if (existsSync(file)) {
			rmSync(file);
			console.log(`Removed ${file}`);
		}
	}
}

function uninstallBiome(): void {
	const packageJsonPath = "package.json";
	if (!existsSync(packageJsonPath)) {
		return;
	}

	const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
	const hasBiome = Boolean(
		pkg.devDependencies?.["@biomejs/biome"] ||
		pkg.dependencies?.["@biomejs/biome"],
	);
	if (!hasBiome) {
		return;
	}

	console.log("Uninstalling @biomejs/biome...");
	execSync("npm uninstall @biomejs/biome", { stdio: "inherit" });
}
