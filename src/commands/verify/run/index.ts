import { spawn } from "node:child_process";
import * as path from "node:path";
import { findPackageJsonWithVerifyScripts } from "../../../shared/readPackageJson";
import {
	createTimerCallback,
	initTaskStatuses,
	logFailedScripts,
} from "./createTimerCallback";

function spawnScript(script: string, cwd: string) {
	return spawn("npm", ["run", script], { stdio: "inherit", shell: true, cwd });
}

function onScriptClose(
	script: string,
	onComplete: ((code: number) => void) | undefined,
	resolve: (value: { script: string; code: number }) => void,
) {
	return (code: number | null) => {
		const exitCode = code ?? 1;
		onComplete?.(exitCode);
		resolve({ script, code: exitCode });
	};
}

function runScript(
	script: string,
	cwd: string,
	onComplete?: (code: number) => void,
): Promise<{ script: string; code: number }> {
	return new Promise((resolve) => {
		spawnScript(script, cwd).on(
			"close",
			onScriptClose(script, onComplete, resolve),
		);
	});
}

function runAllScripts(
	verifyScripts: string[],
	packageDir: string,
	timer: boolean,
) {
	const taskStatuses = initTaskStatuses(verifyScripts);
	return Promise.all(
		verifyScripts.map((script, index) =>
			runScript(
				script,
				packageDir,
				timer ? createTimerCallback(taskStatuses, index) : undefined,
			),
		),
	);
}

function printScriptList(scripts: string[]): void {
	console.log(`Running ${scripts.length} verify script(s) in parallel:`);
	for (const script of scripts) {
		console.log(`  - ${script}`);
	}
}

function exitIfFailed(failed: { script: string; code: number }[]): void {
	if (failed.length === 0) return;
	logFailedScripts(failed);
	process.exit(1);
}

function handleResults(
	results: { script: string; code: number }[],
	totalCount: number,
): void {
	exitIfFailed(results.filter((r) => r.code !== 0));
	console.log(`\nAll ${totalCount} verify script(s) passed`);
}

function resolveVerifyScripts() {
	const result = findPackageJsonWithVerifyScripts(process.cwd());
	if (!result) {
		console.log("No package.json with verify:* scripts found");
		return null;
	}
	return result;
}

function getPackageDir(
	found: NonNullable<ReturnType<typeof resolveVerifyScripts>>,
): string {
	return path.dirname(found.packageJsonPath);
}

async function executeVerifyScripts(
	found: NonNullable<ReturnType<typeof resolveVerifyScripts>>,
	timer: boolean,
): Promise<void> {
	printScriptList(found.verifyScripts);
	const results = await runAllScripts(
		found.verifyScripts,
		getPackageDir(found),
		timer,
	);
	handleResults(results, found.verifyScripts.length);
}

export async function run(options: { timer?: boolean } = {}): Promise<void> {
	const found = resolveVerifyScripts();
	if (!found) return;
	await executeVerifyScripts(found, options.timer ?? false);
}
