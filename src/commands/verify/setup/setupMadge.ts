import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson";
import type { ScriptWriter } from "../installPackage";
import { installPackage } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupMadge(
	packageJsonPath: string,
	writer: ScriptWriter,
): Promise<void> {
	console.log(chalk.blue("\nSetting up madge..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	const hasMadge = !!pkg.dependencies?.madge || !!pkg.devDependencies?.madge;
	if (!hasMadge && !installPackage("madge", cwd)) {
		return;
	}
	writer("verify:madge", expectedScripts["verify:madge"]);
}
