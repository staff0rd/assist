import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import enquirer from "enquirer";

type PackageJson = {
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

type ToolStatus = {
	hasPackage: boolean;
	hasScript: boolean;
};

type ExistingSetup = {
	knip: ToolStatus;
	biome: ToolStatus;
	jscpd: ToolStatus;
	hasVite: boolean;
	hasTypescript: boolean;
	build: ToolStatus;
};

type VerifyOption = {
	name: string;
	value: string;
	description: string;
};

function findPackageJson(): string | null {
	const packageJsonPath = path.join(process.cwd(), "package.json");
	if (fs.existsSync(packageJsonPath)) {
		return packageJsonPath;
	}
	return null;
}

function readPackageJson(filePath: string): PackageJson {
	return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writePackageJson(filePath: string, pkg: PackageJson): void {
	fs.writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function detectExistingSetup(pkg: PackageJson): ExistingSetup {
	return {
		knip: {
			hasPackage: !!pkg.devDependencies?.knip,
			hasScript: !!pkg.scripts?.["verify:knip"],
		},
		biome: {
			hasPackage: !!pkg.devDependencies?.["@biomejs/biome"],
			hasScript: !!pkg.scripts?.["verify:lint"],
		},
		jscpd: {
			hasPackage: !!pkg.dependencies?.jscpd || !!pkg.devDependencies?.jscpd,
			hasScript: !!pkg.scripts?.["verify:duplicate-code"],
		},
		hasVite: !!pkg.devDependencies?.vite || !!pkg.dependencies?.vite,
		hasTypescript: !!pkg.devDependencies?.typescript,
		build: {
			hasPackage: true, // build uses typescript which we check separately
			hasScript: !!pkg.scripts?.["verify:build"],
		},
	};
}

function needsSetup(status: ToolStatus): boolean {
	return !status.hasScript || !status.hasPackage;
}

function getStatusLabel(status: ToolStatus): string {
	if (!status.hasScript) return "";
	if (!status.hasPackage) return " (package missing)";
	return "";
}

function installPackage(name: string): boolean {
	console.log(chalk.dim(`Installing ${name}...`));
	try {
		execSync(`npm install -D ${name}`, { stdio: "inherit" });
		return true;
	} catch {
		console.error(chalk.red(`Failed to install ${name}`));
		return false;
	}
}

function runInit(command: string): boolean {
	console.log(chalk.dim(`Running ${command}...`));
	try {
		execSync(command, { stdio: "inherit" });
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

async function setupKnip(pkg: PackageJson): Promise<PackageJson> {
	console.log(chalk.blue("\nSetting up knip..."));
	installPackage("knip");
	return addScript(pkg, "verify:knip", "knip --no-progress");
}

async function setupLint(pkg: PackageJson): Promise<PackageJson> {
	console.log(chalk.blue("\nSetting up biome..."));
	installPackage("@biomejs/biome");
	runInit("npx biome init");
	return addScript(pkg, "verify:lint", "biome check --write .");
}

async function setupDuplicateCode(pkg: PackageJson): Promise<PackageJson> {
	console.log(chalk.blue("\nSetting up jscpd..."));
	installPackage("jscpd");
	return addScript(
		pkg,
		"verify:duplicate-code",
		"jscpd --format 'typescript,tsx' --exitCode 1 --ignore '**/*.test.*' src",
	);
}

async function setupBuild(
	pkg: PackageJson,
	hasVite: boolean,
): Promise<PackageJson> {
	console.log(chalk.blue("\nSetting up build verification..."));
	const command = hasVite
		? "tsc -b && vite build --logLevel error"
		: "tsc --noEmit";
	console.log(chalk.dim(`Using: ${command}`));
	return addScript(pkg, "verify:build", command);
}

export async function init(): Promise<void> {
	const packageJsonPath = findPackageJson();

	if (!packageJsonPath) {
		console.error(chalk.red("No package.json found in current directory"));
		process.exit(1);
	}

	let pkg = readPackageJson(packageJsonPath);
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

	if (needsSetup(setup.build) && setup.hasTypescript) {
		availableOptions.push({
			name: `build${getStatusLabel(setup.build)}`,
			value: "build",
			description: setup.hasVite
				? "TypeScript + Vite build verification"
				: "TypeScript type checking",
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
				pkg = await setupKnip(pkg);
				break;
			case "lint":
				pkg = await setupLint(pkg);
				break;
			case "duplicate-code":
				pkg = await setupDuplicateCode(pkg);
				break;
			case "build":
				pkg = await setupBuild(pkg, setup.hasVite);
				break;
		}
	}

	writePackageJson(packageJsonPath, pkg);

	console.log(chalk.green(`\nAdded ${selected.length} verify script(s):`));
	for (const choice of selected) {
		console.log(chalk.green(`  - verify:${choice}`));
	}
	console.log(chalk.dim("\nRun 'assist verify' to run all verify scripts"));
}
