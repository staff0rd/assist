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
	setupTypecheck,
} from "../setup";
import { detectExistingSetup } from "./detectExistingSetup";
import { getAvailableOptions } from "./getAvailableOptions";

type SetupHandler = (
	packageJsonPath: string,
	...args: boolean[]
) => Promise<void>;

function getSetupHandlers(
	hasVite: boolean,
	hasTypescript: boolean,
	hasOpenColor: boolean,
): Record<string, SetupHandler> {
	return {
		knip: (p) => setupKnip(p),
		lint: (p) => setupLint(p),
		"duplicate-code": (p) => setupDuplicateCode(p),
		test: (p) => setupTest(p),
		build: (p) => setupBuild(p, hasVite, hasTypescript),
		typecheck: (p) => setupTypecheck(p),
		"hardcoded-colors": (p) => setupHardcodedColors(p, hasOpenColor),
	};
}

async function runSelectedSetups(
	selected: string[],
	packageJsonPath: string,
	handlers: Record<string, SetupHandler>,
): Promise<void> {
	for (const choice of selected) {
		await handlers[choice]?.(packageJsonPath);
	}
	console.log(chalk.green(`\nAdded ${selected.length} verify script(s):`));
	for (const choice of selected) {
		console.log(chalk.green(`  - verify:${choice}`));
	}
	console.log(chalk.dim("\nRun 'assist verify' to run all verify scripts"));
}

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

	const handlers = getSetupHandlers(
		setup.hasVite,
		setup.hasTypescript,
		setup.hasOpenColor,
	);
	await runSelectedSetups(selected, packageJsonPath, handlers);
}
