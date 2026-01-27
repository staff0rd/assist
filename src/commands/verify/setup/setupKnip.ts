import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson";
import { installPackage, setupVerifyScript } from "../installPackage";
import { EXPECTED_SCRIPTS } from "./EXPECTED_SCRIPTS";

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
		EXPECTED_SCRIPTS["verify:knip"],
	);
}
