import chalk from "chalk";
import { readPackageJson } from "../../../shared/readPackageJson";
import { addScript, writePackageJson } from "../installPackage";

export async function setupBuild(
	packageJsonPath: string,
	hasVite: boolean,
	hasTypescript: boolean,
): Promise<void> {
	console.log(chalk.blue("\nSetting up build verification..."));
	let command: string;
	if (hasVite && hasTypescript) {
		command = "tsc -b && vite build --logLevel error";
	} else if (hasVite) {
		command = "vite build --logLevel error";
	} else {
		command = "tsc --noEmit";
	}
	console.log(chalk.dim(`Using: ${command}`));
	const pkg = readPackageJson(packageJsonPath);
	writePackageJson(packageJsonPath, addScript(pkg, "verify:build", command));
}
