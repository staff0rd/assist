import * as path from "node:path";
import chalk from "chalk";
import { addToKnipIgnoreBinaries } from "../addToKnipIgnoreBinaries";
import type { ScriptWriter } from "../installPackage";
import { installPackage } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupHardcodedColors(
	packageJsonPath: string,
	writer: ScriptWriter,
	hasOpenColor: boolean,
): Promise<void> {
	console.log(chalk.blue("\nSetting up hardcoded colors check..."));
	const cwd = path.dirname(packageJsonPath);
	if (!hasOpenColor) {
		installPackage("open-color", cwd);
	}
	addToKnipIgnoreBinaries(cwd, "assist");
	writer("verify:hardcoded-colors", expectedScripts["verify:hardcoded-colors"]);
}
