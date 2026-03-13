import { loadConfig } from "../../../../shared/loadConfig";
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
	hasConfigScripts: boolean;
};

function hasDep(pkg: PackageJson, name: string): boolean {
	return !!pkg.dependencies?.[name] || !!pkg.devDependencies?.[name];
}

function toolStatus(
	pkg: PackageJson,
	scriptName: string,
	hasPackage: boolean,
	configScriptNames: Set<string>,
): ToolStatus {
	const currentScript = pkg.scripts?.[scriptName];
	const hasConfigEntry =
		configScriptNames.has(scriptName) ||
		[...configScriptNames].some((n) => n.startsWith(`${scriptName}-`));
	const expectedCommand = EXPECTED_SCRIPTS[scriptName];
	return {
		hasPackage,
		hasScript: !!currentScript || hasConfigEntry,
		isOutdated:
			!!currentScript && !!expectedCommand && currentScript !== expectedCommand,
	};
}

function loadConfigScriptNames(): Set<string> {
	const config = loadConfig();
	return new Set<string>((config.run ?? []).map((r) => r.name));
}

function buildToolStatuses(pkg: PackageJson, configScriptNames: Set<string>) {
	const status = (script: string, has: boolean) =>
		toolStatus(pkg, script, has, configScriptNames);
	return {
		knip: status("verify:knip", hasDep(pkg, "knip")),
		biome: status("verify:lint", hasDep(pkg, "@biomejs/biome")),
		jscpd: status("verify:duplicate-code", hasDep(pkg, "jscpd")),
		test: status("verify:test", hasDep(pkg, "vitest")),
		build: status("verify:build", true),
		typecheck: status("verify:typecheck", true),
		hardcodedColors: status("verify:hardcoded-colors", true),
		madge: status("verify:madge", hasDep(pkg, "madge")),
		maintainability: status("verify:maintainability", true),
	};
}

export function detectExistingSetup(pkg: PackageJson): ExistingSetup {
	const configScriptNames = loadConfigScriptNames();
	return {
		...buildToolStatuses(pkg, configScriptNames),
		hasVite: hasDep(pkg, "vite"),
		hasTypescript: !!pkg.devDependencies?.typescript,
		hasOpenColor: hasDep(pkg, "open-color"),
		hasConfigScripts: [...configScriptNames].some((n) =>
			n.startsWith("verify:"),
		),
	};
}

export { getStatusLabel, needsSetup } from "./needsSetup";
