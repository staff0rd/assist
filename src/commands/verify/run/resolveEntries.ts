import * as path from "node:path";
import { getConfigDir, loadConfig } from "../../../shared/loadConfig";
import { findPackageJsonWithVerifyScripts } from "../../../shared/readPackageJson";
import { resolveRunConfigs } from "../../../shared/resolveRunConfigs";
import { shellQuote } from "../../../shared/shellQuote";

function buildFullCommand(command: string, args?: string[]): string {
	return [shellQuote(command), ...(args ?? []).map(shellQuote)].join(" ");
}

export type VerifyEntry = {
	name: string;
	fullCommand: string;
	cwd?: string;
	env?: Record<string, string>;
	filter?: string;
	quiet?: boolean;
};

function getRunEntries(): VerifyEntry[] {
	const { run } = loadConfig();
	const configs = resolveRunConfigs(run, getConfigDir());
	return configs
		.filter((r) => r.name.startsWith("verify:"))
		.map((r) => ({
			name: r.name,
			fullCommand: buildFullCommand(r.command, r.args),
			cwd: r.cwd ? path.resolve(getConfigDir(), r.cwd) : undefined,
			env: r.env,
			filter: r.filter,
			quiet: r.quiet,
		}));
}

function getPackageJsonEntries(): VerifyEntry[] {
	const result = findPackageJsonWithVerifyScripts(process.cwd());
	if (!result) return [];
	const cwd = path.dirname(result.packageJsonPath);
	return result.verifyScripts.map((script) => ({
		name: script,
		fullCommand: `npm run ${script}`,
		cwd,
	}));
}

export function resolveEntries(): VerifyEntry[] {
	return [...getRunEntries(), ...getPackageJsonEntries()];
}
