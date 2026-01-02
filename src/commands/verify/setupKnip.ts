import * as path from "node:path";
import chalk from "chalk";
import { readPackageJson } from "../../shared/readPackageJson.js";
import { init as lintInit } from "../lint/init";
import {
	addToKnipIgnoreBinaries,
	installPackage,
	setupVerifyScript,
} from "./installPackage.js";

export const EXPECTED_SCRIPTS: Record<string, string> = {
	"verify:knip": "knip --no-progress",
	"verify:lint": "biome check --write .",
	"verify:duplicate-code":
		"jscpd --format 'typescript,tsx' --exitCode 1 --ignore '**/*.test.*' -r consoleFull src",
	"verify:test": "vitest run --silent",
	"verify:hardcoded-colors": "assist verify hardcoded-colors",
};

export async function setupKnip(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up knip..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.knip && !installPackage("knip", cwd)) {
		return;
	}
	setupVerifyScript(
		packageJsonPath,
		"verify:knip",
		EXPECTED_SCRIPTS["verify:knip"],
	);
}

export async function setupLint(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up biome..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.["@biomejs/biome"]) {
		if (!installPackage("@biomejs/biome", cwd)) {
			return;
		}
	}
	await lintInit();
	setupVerifyScript(
		packageJsonPath,
		"verify:lint",
		EXPECTED_SCRIPTS["verify:lint"],
	);
}

export async function setupDuplicateCode(
	packageJsonPath: string,
): Promise<void> {
	console.log(chalk.blue("\nSetting up jscpd..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	const hasJscpd = !!pkg.dependencies?.jscpd || !!pkg.devDependencies?.jscpd;
	if (!hasJscpd && !installPackage("jscpd", cwd)) {
		return;
	}
	setupVerifyScript(
		packageJsonPath,
		"verify:duplicate-code",
		EXPECTED_SCRIPTS["verify:duplicate-code"],
	);
}

export async function setupTest(packageJsonPath: string): Promise<void> {
	console.log(chalk.blue("\nSetting up vitest..."));
	const cwd = path.dirname(packageJsonPath);
	const pkg = readPackageJson(packageJsonPath);
	if (!pkg.devDependencies?.vitest && !installPackage("vitest", cwd)) {
		return;
	}
	setupVerifyScript(
		packageJsonPath,
		"verify:test",
		EXPECTED_SCRIPTS["verify:test"],
	);
}

export async function setupHardcodedColors(
	packageJsonPath: string,
	hasOpenColor: boolean,
): Promise<void> {
	console.log(chalk.blue("\nSetting up hardcoded colors check..."));
	const cwd = path.dirname(packageJsonPath);
	if (!hasOpenColor) {
		installPackage("open-color", cwd);
	}
	addToKnipIgnoreBinaries(cwd, "assist");
	setupVerifyScript(
		packageJsonPath,
		"verify:hardcoded-colors",
		EXPECTED_SCRIPTS["verify:hardcoded-colors"],
	);
}

export { setupBuild } from "./setupBuild.js";
