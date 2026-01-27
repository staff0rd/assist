import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson";
import { installPackage, setupVerifyScript } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupDuplicateCode(
	packageJsonPath: string,
): Promise<void> {
	console.log(chalk.blue("\nSetting up jscpd..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	const hasJscpd = !!pkg.dependencies?.jscpd || !!pkg.devDependencies?.jscpd;
	if (!hasJscpd && !installPackage("jscpd", cwd)) {
		return;
	}
	setupVerifyScript(
		packageJsonPath,
		"verify:duplicate-code",
		expectedScripts["verify:duplicate-code"],
	);
}
