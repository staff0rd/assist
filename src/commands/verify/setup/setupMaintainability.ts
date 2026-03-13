import * as path from "node:path";
import chalk from "chalk";
import { addToKnipIgnoreBinaries } from "../addToKnipIgnoreBinaries";
import type { ScriptWriter } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupMaintainability(
	packageJsonPath: string,
	writer: ScriptWriter,
): Promise<void> {
	console.log(chalk.blue("\nSetting up maintainability check..."));
	addToKnipIgnoreBinaries(path.dirname(packageJsonPath), "assist");
	writer("verify:maintainability", expectedScripts["verify:maintainability"]);
}
