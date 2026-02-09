import chalk from "chalk";
import { promptMultiselect } from "../../../shared/promptMultiselect";
import { requirePackageJson } from "../../../shared/readPackageJson";
import {
	createExtensionsJson,
	createLaunchJson,
	createSettingsJson,
	ensureVscodeFolder,
	removeVscodeFromGitignore,
} from "./createLaunchJson";
import { detectVscodeSetup } from "./detectVscodeSetup";

type ConfigOption = {
	name: string;
	value: string;
	description: string;
};

export async function init(): Promise<void> {
	const { pkg } = requirePackageJson();
	const setup = detectVscodeSetup(pkg);

	const availableOptions: ConfigOption[] = [];

	if (!setup.hasLaunchJson && setup.hasVite) {
		availableOptions.push({
			name: "launch",
			value: "launch",
			description: "Debug configuration for Vite dev server",
		});
	}

	if (!setup.hasSettingsJson) {
		availableOptions.push({
			name: "settings",
			value: "settings",
			description: "Biome formatter configuration",
		});
	}

	if (availableOptions.length === 0) {
		console.log(chalk.green("VS Code configuration already exists!"));
		return;
	}

	console.log(chalk.bold("Available VS Code configurations to add:\n"));

	const selected = await promptMultiselect(
		"Select configurations to add:",
		availableOptions,
	);

	if (selected.length === 0) {
		console.log(chalk.yellow("No configurations selected"));
		return;
	}

	removeVscodeFromGitignore();
	ensureVscodeFolder();

	for (const choice of selected) {
		switch (choice) {
			case "launch":
				createLaunchJson();
				break;
			case "settings":
				createSettingsJson();
				createExtensionsJson();
				break;
		}
	}

	console.log(
		chalk.green(`\nAdded ${selected.length} VS Code configuration(s)`),
	);
}
