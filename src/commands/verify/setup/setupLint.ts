import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson.js";
import { init as lintInit } from "../../lint/init.js";
import { installPackage, setupVerifyScript } from "../installPackage.js";
import { EXPECTED_SCRIPTS } from "./EXPECTED_SCRIPTS.js";

export async function setupLint(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up biome..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.["@biomejs/biome"]) {
		if (!installPackage("@biomejs/biome", cwd)) {
			return;
		}
	}
	await lintInit();
	setupVerifyScript(
		packageJsonPath,
		"verify:lint",
		EXPECTED_SCRIPTS["verify:lint"],
	);
}
