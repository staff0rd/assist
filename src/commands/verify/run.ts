import { spawn } from "node:child_process";
import * as path from "node:path";
import { findPackageJsonWithVerifyScripts } from "../../shared/readPackageJson";

type TaskStatus = {
	script: string;
	startTime: number;
	endTime?: number;
	code?: number;
};

function formatDuration(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`;
	}
	const seconds = (ms / 1000).toFixed(1);
	return `${seconds}s`;
}

function printTaskStatuses(tasks: TaskStatus[]): void {
	console.log("\n--- Task Status ---");
	for (const task of tasks) {
		if (task.endTime !== undefined) {
			const duration = formatDuration(task.endTime - task.startTime);
			const status = task.code === 0 ? "✓" : "✗";
			console.log(`  ${status} ${task.script}: ${duration}`);
		} else {
			const elapsed = formatDuration(Date.now() - task.startTime);
			console.log(`  ⋯ ${task.script}: running (${elapsed})`);
		}
	}
	console.log("-------------------\n");
}

export async function run(options: { timer?: boolean } = {}): Promise<void> {
	const { timer = false } = options;
	const result = findPackageJsonWithVerifyScripts(process.cwd());

	if (!result) {
		console.log("No package.json with verify:* scripts found");
		return;
	}

	const { packageJsonPath, verifyScripts } = result;
	const packageDir = path.dirname(packageJsonPath);

	console.log(`Running ${verifyScripts.length} verify script(s) in parallel:`);
	for (const script of verifyScripts) {
		console.log(`  - ${script}`);
	}

	const taskStatuses: TaskStatus[] = verifyScripts.map((script) => ({
		script,
		startTime: Date.now(),
	}));

	const results = await Promise.all(
		verifyScripts.map(
			(script, index) =>
				new Promise<{ script: string; code: number }>((resolve) => {
					const child = spawn("npm", ["run", script], {
						stdio: "inherit",
						shell: true,
						cwd: packageDir,
					});
					child.on("close", (code) => {
						const exitCode = code ?? 1;
						if (timer) {
							taskStatuses[index].endTime = Date.now();
							taskStatuses[index].code = exitCode;
							printTaskStatuses(taskStatuses);
						}
						resolve({ script, code: exitCode });
					});
				}),
		),
	);

	const failed = results.filter((r) => r.code !== 0);
	if (failed.length > 0) {
		console.error(`\n${failed.length} script(s) failed:`);
		for (const f of failed) {
			console.error(`  - ${f.script} (exit code ${f.code})`);
		}
		process.exit(1);
	}

	console.log(`\nAll ${verifyScripts.length} verify script(s) passed`);
}
