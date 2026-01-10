import type { PackageJson } from "../../shared/readPackageJson.js";
import { EXPECTED_SCRIPTS } from "./setup/index.js";

type ToolStatus = {
	hasPackage: boolean;
	hasScript: boolean;
	isOutdated: boolean;
};

export type ExistingSetup = {
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

function isScriptOutdated(
	pkg: PackageJson,
	scriptName: string,
	expectedCommand: string | undefined,
): boolean {
	const currentScript = pkg.scripts?.[scriptName];
	if (!currentScript || !expectedCommand) return false;
	return currentScript !== expectedCommand;
}

export function detectExistingSetup(pkg: PackageJson): ExistingSetup {
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
			hasPackage: true,
			hasScript: !!pkg.scripts?.["verify:build"],
			isOutdated: false,
		},
		hardcodedColors: {
			hasPackage: true,
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

export { getStatusLabel, needsSetup } from "./needsSetup.js";
