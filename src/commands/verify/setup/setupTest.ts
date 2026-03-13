import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson";
import type { ScriptWriter } from "../installPackage";
import { installPackage } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupTest(
	packageJsonPath: string,
	writer: ScriptWriter,
): Promise<void> {
	console.log(chalk.blue("\nSetting up vitest..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.vitest && !installPackage("vitest", cwd)) {
		return;
	}
	writer("verify:test", expectedScripts["verify:test"]);
}
