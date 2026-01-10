import * as path from "node:path";
import chalk from "chalk";
import {
	addToKnipIgnoreBinaries,
	installPackage,
	setupVerifyScript,
} from "../installPackage.js";
import { EXPECTED_SCRIPTS } from "./EXPECTED_SCRIPTS.js";

export async function setupHardcodedColors(
	packageJsonPath: string,
	hasOpenColor: boolean,
): Promise<void> {
	console.log(chalk.blue("\nSetting up hardcoded colors check..."));
	const cwd = path.dirname(packageJsonPath);
	if (!hasOpenColor) {
		installPackage("open-color", cwd);
	}
	addToKnipIgnoreBinaries(cwd, "assist");
	setupVerifyScript(
		packageJsonPath,
		"verify:hardcoded-colors",
		EXPECTED_SCRIPTS["verify:hardcoded-colors"],
	);
}
