import * as path from "node:path";
import { loadConfig } from "../../../shared/loadConfig";
import { findPackageJsonWithVerifyScripts } from "../../../shared/readPackageJson";

function quoteIfNeeded(arg: string): string {
	return arg.includes(" ") ? `"${arg}"` : arg;
}

function buildFullCommand(command: string, args?: string[]): string {
	return [quoteIfNeeded(command), ...(args ?? []).map(quoteIfNeeded)].join(" ");
}

export type VerifyEntry = {
	name: string;
	fullCommand: string;
	cwd?: string;
	filter?: string;
};

function getRunEntries(): VerifyEntry[] {
	const { run } = loadConfig();
	if (!run) return [];
	return run
		.filter((r) => r.name.startsWith("verify:"))
		.map((r) => ({
			name: r.name,
			fullCommand: buildFullCommand(r.command, r.args),
			filter: r.filter,
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
