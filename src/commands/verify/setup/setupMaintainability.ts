import * as path from "node:path";
import chalk from "chalk";
import { addToKnipIgnoreBinaries, setupVerifyScript } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupMaintainability(
	packageJsonPath: string,
): Promise<void> {
	console.log(chalk.blue("\nSetting up maintainability check..."));
	addToKnipIgnoreBinaries(path.dirname(packageJsonPath), "assist");
	setupVerifyScript(
		packageJsonPath,
		"verify:maintainability",
		expectedScripts["verify:maintainability"],
	);
}
