import type { PackageJson } from "../../../../shared/readPackageJson";
import { EXPECTED_SCRIPTS } from "../../setup";

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
	typecheck: ToolStatus;
	hardcodedColors: ToolStatus;
	hasOpenColor: boolean;
};

function toolStatus(
	pkg: PackageJson,
	scriptName: string,
	hasPackage: boolean,
): ToolStatus {
	const currentScript = pkg.scripts?.[scriptName];
	const expectedCommand = EXPECTED_SCRIPTS[scriptName];
	return {
		hasPackage,
		hasScript: !!currentScript,
		isOutdated:
			!!currentScript && !!expectedCommand && currentScript !== expectedCommand,
	};
}

export function detectExistingSetup(pkg: PackageJson): ExistingSetup {
	return {
		knip: toolStatus(pkg, "verify:knip", !!pkg.devDependencies?.knip),
		biome: toolStatus(
			pkg,
			"verify:lint",
			!!pkg.devDependencies?.["@biomejs/biome"],
		),
		jscpd: toolStatus(
			pkg,
			"verify:duplicate-code",
			!!pkg.dependencies?.jscpd || !!pkg.devDependencies?.jscpd,
		),
		test: toolStatus(pkg, "verify:test", !!pkg.devDependencies?.vitest),
		hasVite: !!pkg.devDependencies?.vite || !!pkg.dependencies?.vite,
		hasTypescript: !!pkg.devDependencies?.typescript,
		build: toolStatus(pkg, "verify:build", true),
		typecheck: toolStatus(pkg, "verify:typecheck", true),
		hardcodedColors: toolStatus(pkg, "verify:hardcoded-colors", true),
		hasOpenColor:
			!!pkg.dependencies?.["open-color"] ||
			!!pkg.devDependencies?.["open-color"],
	};
}

export { getStatusLabel, needsSetup } from "./needsSetup";
