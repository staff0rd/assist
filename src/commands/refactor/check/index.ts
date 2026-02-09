import { spawn } from "node:child_process";
import * as path from "node:path";
import { findPackageJsonWithVerifyScripts } from "../../../shared/readPackageJson";
import { DEFAULT_MAX_LINES, logViolations } from "../logViolations";
import { type GitFilterOptions, getViolations } from "./getViolations";

type CheckOptions = GitFilterOptions & {
	maxLines?: number;
};

async function runVerifyQuietly(): Promise<boolean> {
	const result = findPackageJsonWithVerifyScripts(process.cwd());

	if (!result) {
		return true;
	}

	const { packageJsonPath, verifyScripts } = result;
	const packageDir = path.dirname(packageJsonPath);

	const results = await Promise.all(
		verifyScripts.map(
			(script) =>
				new Promise<{ script: string; code: number; output: string }>(
					(resolve) => {
						const child = spawn("npm", ["run", script], {
							stdio: "pipe",
							shell: true,
							cwd: packageDir,
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
					},
				),
		),
	);

	const failed = results.filter((r) => r.code !== 0);
	if (failed.length > 0) {
		for (const f of failed) {
			console.error(f.output);
		}
		console.error(`\n${failed.length} verify script(s) failed:`);
		for (const f of failed) {
			console.error(`  - ${f.script} (exit code ${f.code})`);
		}
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
