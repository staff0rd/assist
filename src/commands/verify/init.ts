import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import enquirer from "enquirer";
import {
	type PackageJson,
	readPackageJson,
	requirePackageJson,
} from "../../shared/readPackageJson.js";

type ToolStatus = {
	hasPackage: boolean;
	hasScript: boolean;
	isOutdated: boolean;
};

const EXPECTED_SCRIPTS: Record<string, string> = {
	"verify:knip": "knip --no-progress",
	"verify:lint": "biome check --write .",
	"verify:duplicate-code":
		"jscpd --format 'typescript,tsx' --exitCode 1 --ignore '**/*.test.*' -r consoleFull src",
	"verify:test": "vitest run --silent",
	"verify:hardcoded-colors": "assist verify hardcoded-colors",
};

type ExistingSetup = {
	knip: ToolStatus;
	biome: ToolStatus;
	jscpd: ToolStatus;
	test: ToolStatus;
	hasVite: boolean;
	hasTypescript: boolean;
	build: ToolStatus;
	hardcodedColors: ToolStatus;
	hasOpenColor: boolean;
};

type VerifyOption = {
	name: string;
	value: string;
	description: string;
};

function writePackageJson(filePath: string, pkg: PackageJson): void {
	fs.writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function isScriptOutdated(
	pkg: PackageJson,
	scriptName: string,
	expectedCommand: string | undefined,
): boolean {
	const currentScript = pkg.scripts?.[scriptName];
	if (!currentScript || !expectedCommand) return false;
	return currentScript !== expectedCommand;
}

function detectExistingSetup(pkg: PackageJson): ExistingSetup {
	return {
		knip: {
			hasPackage: !!pkg.devDependencies?.knip,
			hasScript: !!pkg.scripts?.["verify:knip"],
			isOutdated: isScriptOutdated(
				pkg,
				"verify:knip",
				EXPECTED_SCRIPTS["verify:knip"],
			),
		},
		biome: {
			hasPackage: !!pkg.devDependencies?.["@biomejs/biome"],
			hasScript: !!pkg.scripts?.["verify:lint"],
			isOutdated: isScriptOutdated(
				pkg,
				"verify:lint",
				EXPECTED_SCRIPTS["verify:lint"],
			),
		},
		jscpd: {
			hasPackage: !!pkg.dependencies?.jscpd || !!pkg.devDependencies?.jscpd,
			hasScript: !!pkg.scripts?.["verify:duplicate-code"],
			isOutdated: isScriptOutdated(
				pkg,
				"verify:duplicate-code",
				EXPECTED_SCRIPTS["verify:duplicate-code"],
			),
		},
		test: {
			hasPackage: !!pkg.devDependencies?.vitest,
			hasScript: !!pkg.scripts?.["verify:test"],
			isOutdated: isScriptOutdated(
				pkg,
				"verify:test",
				EXPECTED_SCRIPTS["verify:test"],
			),
		},
		hasVite: !!pkg.devDependencies?.vite || !!pkg.dependencies?.vite,
		hasTypescript: !!pkg.devDependencies?.typescript,
		build: {
			hasPackage: true, // build uses typescript which we check separately
			hasScript: !!pkg.scripts?.["verify:build"],
			isOutdated: false, // build command varies by project
		},
		hardcodedColors: {
			hasPackage: true, // uses assist CLI
			hasScript: !!pkg.scripts?.["verify:hardcoded-colors"],
			isOutdated: isScriptOutdated(
				pkg,
				"verify:hardcoded-colors",
				EXPECTED_SCRIPTS["verify:hardcoded-colors"],
			),
		},
		hasOpenColor:
			!!pkg.dependencies?.["open-color"] ||
			!!pkg.devDependencies?.["open-color"],
	};
}

function needsSetup(status: ToolStatus): boolean {
	return !status.hasScript || !status.hasPackage || status.isOutdated;
}

function getStatusLabel(status: ToolStatus): string {
	if (status.isOutdated) return " (outdated)";
	if (!status.hasScript) return "";
	if (!status.hasPackage) return " (package missing)";
	return "";
}

function installPackage(name: string, cwd: string): boolean {
	console.log(chalk.dim(`Installing ${name}...`));
	try {
		execSync(`npm install -D ${name}`, { stdio: "inherit", cwd });
		return true;
	} catch {
		console.error(chalk.red(`Failed to install ${name}`));
		return false;
	}
}

function runInit(command: string, cwd: string): boolean {
	console.log(chalk.dim(`Running ${command}...`));
	try {
		execSync(command, { stdio: "inherit", cwd });
		return true;
	} catch {
		console.error(chalk.yellow(`Warning: ${command} failed`));
		return false;
	}
}

function addScript(
	pkg: PackageJson,
	name: string,
	command: string,
): PackageJson {
	return {
		...pkg,
		scripts: {
			...pkg.scripts,
			[name]: command,
		},
	};
}

async function setupKnip(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up knip..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.knip && !installPackage("knip", cwd)) {
		return;
	}
	writePackageJson(
		packageJsonPath,
		addScript(
			readPackageJson(packageJsonPath),
			"verify:knip",
			EXPECTED_SCRIPTS["verify:knip"],
		),
	);
}

async function setupLint(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up biome..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.["@biomejs/biome"]) {
		if (!installPackage("@biomejs/biome", cwd)) {
			return;
		}
		runInit("npx biome init", cwd);
	}
	writePackageJson(
		packageJsonPath,
		addScript(
			readPackageJson(packageJsonPath),
			"verify:lint",
			EXPECTED_SCRIPTS["verify:lint"],
		),
	);
}

async function setupDuplicateCode(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up jscpd..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	const hasJscpd = !!pkg.dependencies?.jscpd || !!pkg.devDependencies?.jscpd;
	if (!hasJscpd && !installPackage("jscpd", cwd)) {
		return;
	}
	writePackageJson(
		packageJsonPath,
		addScript(
			readPackageJson(packageJsonPath),
			"verify:duplicate-code",
			EXPECTED_SCRIPTS["verify:duplicate-code"],
		),
	);
}

async function setupTest(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up vitest..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.vitest && !installPackage("vitest", cwd)) {
		return;
	}
	writePackageJson(
		packageJsonPath,
		addScript(
			readPackageJson(packageJsonPath),
			"verify:test",
			EXPECTED_SCRIPTS["verify:test"],
		),
	);
}

function addToKnipIgnoreBinaries(cwd: string, binary: string): void {
	const knipJsonPath = path.join(cwd, "knip.json");
	try {
		let knipConfig: Record<string, unknown>;
		if (fs.existsSync(knipJsonPath)) {
			knipConfig = JSON.parse(fs.readFileSync(knipJsonPath, "utf-8"));
		} else {
			knipConfig = { $schema: "https://unpkg.com/knip@5/schema.json" };
		}
		const ignoreBinaries: string[] =
			(knipConfig.ignoreBinaries as string[]) ?? [];
		if (!ignoreBinaries.includes(binary)) {
			knipConfig.ignoreBinaries = [...ignoreBinaries, binary];
			fs.writeFileSync(
				knipJsonPath,
				`${JSON.stringify(knipConfig, null, "\t")}\n`,
			);
			console.log(chalk.dim(`Added '${binary}' to knip.json ignoreBinaries`));
		}
	} catch {
		console.log(chalk.yellow("Warning: Could not update knip.json"));
	}
}

async function setupHardcodedColors(
	packageJsonPath: string,
	hasOpenColor: boolean,
): Promise<void> {
	console.log(chalk.blue("\nSetting up hardcoded colors check..."));
	const cwd = path.dirname(packageJsonPath);
	if (!hasOpenColor) {
		installPackage("open-color", cwd);
	}
	addToKnipIgnoreBinaries(cwd, "assist");
	writePackageJson(
		packageJsonPath,
		addScript(
			readPackageJson(packageJsonPath),
			"verify:hardcoded-colors",
			EXPECTED_SCRIPTS["verify:hardcoded-colors"],
		),
	);
}

async function setupBuild(
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

export async function init(): Promise<void> {
	const { packageJsonPath, pkg } = requirePackageJson();
	const setup = detectExistingSetup(pkg);

	const availableOptions: VerifyOption[] = [];

	if (needsSetup(setup.knip)) {
		availableOptions.push({
			name: `knip${getStatusLabel(setup.knip)}`,
			value: "knip",
			description: "Dead code and unused dependency detection",
		});
	}

	if (needsSetup(setup.biome)) {
		availableOptions.push({
			name: `lint${getStatusLabel(setup.biome)}`,
			value: "lint",
			description: "Code linting and formatting with Biome",
		});
	}

	if (needsSetup(setup.jscpd)) {
		availableOptions.push({
			name: `duplicate-code${getStatusLabel(setup.jscpd)}`,
			value: "duplicate-code",
			description: "Duplicate code detection with jscpd",
		});
	}

	if (needsSetup(setup.test) && setup.test.hasPackage) {
		availableOptions.push({
			name: `test${getStatusLabel(setup.test)}`,
			value: "test",
			description: "Run tests with vitest",
		});
	}

	if (needsSetup(setup.build) && (setup.hasTypescript || setup.hasVite)) {
		const description = setup.hasVite
			? setup.hasTypescript
				? "TypeScript + Vite build verification"
				: "Vite build verification"
			: "TypeScript type checking";
		availableOptions.push({
			name: `build${getStatusLabel(setup.build)}`,
			value: "build",
			description,
		});
	}

	if (needsSetup(setup.hardcodedColors)) {
		availableOptions.push({
			name: `hardcoded-colors${getStatusLabel(setup.hardcodedColors)}`,
			value: "hardcoded-colors",
			description: "Detect hardcoded hex colors (use open-color instead)",
		});
	}

	if (availableOptions.length === 0) {
		console.log(chalk.green("All verify scripts are already configured!"));
		return;
	}

	console.log(chalk.bold("Available verify scripts to add:\n"));

	const { selected } = await enquirer.prompt<{ selected: string[] }>({
		type: "multiselect",
		name: "selected",
		message: "Select verify scripts to add:",
		choices: availableOptions.map((opt) => ({
			name: opt.value,
			message: `${opt.name} - ${chalk.dim(opt.description)}`,
		})),
	});

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
