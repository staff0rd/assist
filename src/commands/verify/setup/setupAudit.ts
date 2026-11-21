import * as path from "node:path";
import chalk from "chalk";
import { addToKnipIgnoreBinaries } from "../addToKnipIgnoreBinaries";
import type { ScriptWriter } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupAudit(
	packageJsonPath: string,
	writer: ScriptWriter,
): Promise<void> {
	console.log(chalk.blue("\nSetting up dependency audit check..."));
	addToKnipIgnoreBinaries(path.dirname(packageJsonPath), "assist");
	writer("verify:audit", expectedScripts["verify:audit"]);
}
