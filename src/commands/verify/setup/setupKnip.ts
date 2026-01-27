import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson";
import { installPackage, setupVerifyScript } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupKnip(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up knip..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.knip && !installPackage("knip", cwd)) {
		return;
	}
	setupVerifyScript(
		packageJsonPath,
		"verify:knip",
		expectedScripts["verify:knip"],
	);
}
