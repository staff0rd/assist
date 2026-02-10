import { spawn } from "node:child_process";
import * as path from "node:path";
import { findPackageJsonWithVerifyScripts } from "../../../shared/readPackageJson";
import { DEFAULT_MAX_LINES, logViolations } from "../logViolations";
import { type GitFilterOptions, getViolations } from "./getViolations";

type CheckOptions = GitFilterOptions & {
	maxLines?: number;
};

function runScript(
	script: string,
	cwd: string,
): Promise<{ script: string; code: number; output: string }> {
	return new Promise((resolve) => {
		const child = spawn("npm", ["run", script], {
			stdio: "pipe",
			shell: true,
			cwd,
		});
		let output = "";
		child.stdout?.on("data", (data) => {
			output += data.toString();
		});
		child.stderr?.on("data", (data) => {
			output += data.toString();
		});
		child.on("close", (code) => {
			resolve({ script, code: code ?? 1, output });
		});
	});
}

function logFailures(
	failed: { script: string; code: number; output: string }[],
): void {
	for (const f of failed) {
		console.error(f.output);
	}
	console.error(`\n${failed.length} verify script(s) failed:`);
	for (const f of failed) {
		console.error(`  - ${f.script} (exit code ${f.code})`);
	}
}

async function runVerifyQuietly(): Promise<boolean> {
	const result = findPackageJsonWithVerifyScripts(process.cwd());
	if (!result) return true;

	const packageDir = path.dirname(result.packageJsonPath);
	const results = await Promise.all(
		result.verifyScripts.map((script) => runScript(script, packageDir)),
	);

	const failed = results.filter((r) => r.code !== 0);
	if (failed.length > 0) {
		logFailures(failed);
		return false;
	}
	return true;
}

export async function check(
	pattern: string | undefined,
	options: CheckOptions,
): Promise<void> {
	const verifyPassed = await runVerifyQuietly();
	if (!verifyPassed) {
		process.exit(1);
	}

	const maxLines = options.maxLines ?? DEFAULT_MAX_LINES;
	const violations = getViolations(pattern, options, maxLines);
	violations.sort((a, b) => b.lines - a.lines);
	logViolations(violations, maxLines);

	if (violations.length > 0) {
		process.exit(1);
	}
}
