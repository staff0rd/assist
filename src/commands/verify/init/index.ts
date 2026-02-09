import chalk from "chalk";
import { promptMultiselect } from "../../../shared/promptMultiselect";
import { requirePackageJson } from "../../../shared/readPackageJson";
import {
	setupBuild,
	setupDuplicateCode,
	setupHardcodedColors,
	setupKnip,
	setupLint,
	setupTest,
} from "../setup";
import { detectExistingSetup } from "./detectExistingSetup";
import { getAvailableOptions } from "./getAvailableOptions";

export async function init(): Promise<void> {
	const { packageJsonPath, pkg } = requirePackageJson();
	const setup = detectExistingSetup(pkg);
	const availableOptions = getAvailableOptions(setup);

	if (availableOptions.length === 0) {
		console.log(chalk.green("All verify scripts are already configured!"));
		return;
	}

	console.log(chalk.bold("Available verify scripts to add:\n"));

	const selected = await promptMultiselect(
		"Select verify scripts to add:",
		availableOptions,
	);

	if (selected.length === 0) {
		console.log(chalk.yellow("No scripts selected"));
		return;
	}

	for (const choice of selected) {
		switch (choice) {
			case "knip":
				await setupKnip(packageJsonPath);
				break;
			case "lint":
				await setupLint(packageJsonPath);
				break;
			case "duplicate-code":
				await setupDuplicateCode(packageJsonPath);
				break;
			case "test":
				await setupTest(packageJsonPath);
				break;
			case "build":
				await setupBuild(packageJsonPath, setup.hasVite, setup.hasTypescript);
				break;
			case "hardcoded-colors":
				await setupHardcodedColors(packageJsonPath, setup.hasOpenColor);
				break;
		}
	}

	console.log(chalk.green(`\nAdded ${selected.length} verify script(s):`));
	for (const choice of selected) {
		console.log(chalk.green(`  - verify:${choice}`));
	}
	console.log(chalk.dim("\nRun 'assist verify' to run all verify scripts"));
}
