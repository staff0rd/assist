import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { promptMultiselect } from "../../shared/promptMultiselect";
import {
	type PackageJson,
	requirePackageJson,
} from "../../shared/readPackageJson";
import {
	createExtensionsJson,
	createLaunchJson,
	createSettingsJson,
	ensureVscodeFolder,
	removeVscodeFromGitignore,
} from "./createLaunchJson";

type ExistingSetup = {
	hasVscodeFolder: boolean;
	hasLaunchJson: boolean;
	hasSettingsJson: boolean;
	hasVite: boolean;
};

type ConfigOption = {
	name: string;
	value: string;
	description: string;
};

function detectExistingSetup(pkg: PackageJson): ExistingSetup {
	const vscodeDir = path.join(process.cwd(), ".vscode");
	return {
		hasVscodeFolder: fs.existsSync(vscodeDir),
		hasLaunchJson: fs.existsSync(path.join(vscodeDir, "launch.json")),
		hasSettingsJson: fs.existsSync(path.join(vscodeDir, "settings.json")),
		hasVite: !!pkg.devDependencies?.vite || !!pkg.dependencies?.vite,
	};
}

export async function init(): Promise<void> {
	const { pkg } = requirePackageJson();
	const setup = detectExistingSetup(pkg);

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
