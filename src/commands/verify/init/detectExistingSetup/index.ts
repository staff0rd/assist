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
	madge: ToolStatus;
	maintainability: ToolStatus;
	hasOpenColor: boolean;
};

function hasDep(pkg: PackageJson, name: string): boolean {
	return !!pkg.dependencies?.[name] || !!pkg.devDependencies?.[name];
}

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
	const status = (script: string, has: boolean) => toolStatus(pkg, script, has);
	return {
		knip: status("verify:knip", hasDep(pkg, "knip")),
		biome: status("verify:lint", hasDep(pkg, "@biomejs/biome")),
		jscpd: status("verify:duplicate-code", hasDep(pkg, "jscpd")),
		test: status("verify:test", hasDep(pkg, "vitest")),
		hasVite: hasDep(pkg, "vite"),
		hasTypescript: !!pkg.devDependencies?.typescript,
		build: status("verify:build", true),
		typecheck: status("verify:typecheck", true),
		hardcodedColors: status("verify:hardcoded-colors", true),
		madge: status("verify:madge", hasDep(pkg, "madge")),
		maintainability: status("verify:maintainability", true),
		hasOpenColor: hasDep(pkg, "open-color"),
	};
}

export { getStatusLabel, needsSetup } from "./needsSetup";
