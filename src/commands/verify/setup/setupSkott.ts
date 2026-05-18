import chalk from "chalk";
import type { ScriptWriter } from "../installPackage";
import { expectedScripts } from "./expectedScripts";

export async function setupSkott(
	_packageJsonPath: string,
	writer: ScriptWriter,
): Promise<void> {
	console.log(chalk.blue("\nSetting up circular dependency check..."));
	writer("verify:circular-deps", expectedScripts["verify:circular-deps"], {
		quiet: true,
	});
}
