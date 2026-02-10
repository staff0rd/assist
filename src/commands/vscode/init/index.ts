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

const SETUP_HANDLERS: Record<string, () => void> = {
	launch: () => createLaunchJson(),
	settings: () => {
		createSettingsJson();
		createExtensionsJson();
	},
};

function getAvailableOptions(
	setup: ReturnType<typeof detectVscodeSetup>,
): ConfigOption[] {
	const options: ConfigOption[] = [];
	if (!setup.hasLaunchJson && setup.hasVite)
		options.push({
			name: "launch",
			value: "launch",
			description: "Debug configuration for Vite dev server",
		});
	if (!setup.hasSettingsJson)
		options.push({
			name: "settings",
			value: "settings",
			description: "Biome formatter configuration",
		});
	return options;
}

export async function init(): Promise<void> {
	const { pkg } = requirePackageJson();
	const setup = detectVscodeSetup(pkg);
	const availableOptions = getAvailableOptions(setup);

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
	for (const choice of selected) SETUP_HANDLERS[choice]?.();

	console.log(
		chalk.green(`\nAdded ${selected.length} VS Code configuration(s)`),
	);
}
