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
import { type ConfigOption, getAvailableOptions } from "./getAvailableOptions";

function applySelections(
	selected: string[],
	setup: ReturnType<typeof detectVscodeSetup>,
): void {
	removeVscodeFromGitignore();
	ensureVscodeFolder();
	const launchType = setup.hasVite ? "vite" : "tsup";
	const handlers: Record<string, () => void> = {
		launch: () => createLaunchJson(launchType),
		settings: () => {
			createSettingsJson();
			createExtensionsJson();
		},
	};
	for (const choice of selected) handlers[choice]?.();
}

async function promptForOptions(options: ConfigOption[]): Promise<string[]> {
	console.log(chalk.bold("Available VS Code configurations to add:\n"));
	return promptMultiselect("Select configurations to add:", options);
}

export async function init({ all = false } = {}): Promise<void> {
	const { pkg } = requirePackageJson();
	const setup = detectVscodeSetup(pkg);
	const options = getAvailableOptions(setup);

	if (options.length === 0) {
		console.log(chalk.green("VS Code configuration already exists!"));
		return;
	}

	const selected = all
		? options.map((o) => o.value)
		: await promptForOptions(options);
	if (selected.length === 0) {
		console.log(chalk.yellow("No configurations selected"));
		return;
	}

	applySelections(selected, setup);
	console.log(
		chalk.green(`\nAdded ${selected.length} VS Code configuration(s)`),
	);
}
