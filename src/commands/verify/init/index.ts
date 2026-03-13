import chalk from "chalk";
import { promptMultiselect } from "../../../shared/promptMultiselect";
import { requirePackageJson } from "../../../shared/readPackageJson";
import type { ScriptWriter } from "../installPackage";
import { setupVerifyScript } from "../installPackage";
import { setupVerifyRunEntry } from "../setupVerifyRunEntry";
import { detectExistingSetup } from "./detectExistingSetup";
import { getAvailableOptions } from "./getAvailableOptions";
import { getSetupHandlers, type SetupHandler } from "./getSetupHandlers";

async function runSelectedSetups(
	selected: string[],
	packageJsonPath: string,
	writer: ScriptWriter,
	handlers: Record<string, SetupHandler>,
): Promise<void> {
	for (const choice of selected) {
		await handlers[choice]?.(packageJsonPath, writer);
	}
	console.log(chalk.green(`\nAdded ${selected.length} verify script(s):`));
	for (const choice of selected) {
		console.log(chalk.green(`  - verify:${choice}`));
	}
	console.log(chalk.dim("\nRun 'assist verify' to run all verify scripts"));
}

async function promptForScripts(
	availableOptions: { name: string; value: string; description: string }[],
): Promise<string[] | null> {
	if (availableOptions.length === 0) {
		console.log(chalk.green("All verify scripts are already configured!"));
		return null;
	}

	console.log(chalk.bold("Available verify scripts to add:\n"));

	const selected = await promptMultiselect(
		"Select verify scripts to add:",
		availableOptions,
	);

	if (selected.length === 0) {
		console.log(chalk.yellow("No scripts selected"));
		return null;
	}

	return selected;
}

export async function init(): Promise<void> {
	const { packageJsonPath, pkg } = requirePackageJson();
	const setup = detectExistingSetup(pkg);
	const selected = await promptForScripts(getAvailableOptions(setup));

	if (!selected) return;

	const writer: ScriptWriter = setup.hasConfigScripts
		? setupVerifyRunEntry
		: (name, cmd) => setupVerifyScript(packageJsonPath, name, cmd);

	const handlers = getSetupHandlers(
		setup.hasVite,
		setup.hasTypescript,
		setup.hasOpenColor,
	);
	await runSelectedSetups(selected, packageJsonPath, writer, handlers);
}
