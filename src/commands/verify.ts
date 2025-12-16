import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

function findPackageJsonWithVerifyScripts(startDir: string): {
	packageJsonPath: string;
	verifyScripts: string[];
} | null {
	let currentDir = startDir;

	while (true) {
		const packageJsonPath = path.join(currentDir, "package.json");

		if (fs.existsSync(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
			const scripts = packageJson.scripts || {};
			const verifyScripts = Object.keys(scripts).filter((name) =>
				name.startsWith("verify:"),
			);

			if (verifyScripts.length > 0) {
				return { packageJsonPath, verifyScripts };
			}
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			return null;
		}
		currentDir = parentDir;
	}
}

export async function verify(): Promise<void> {
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

	const results = await Promise.all(
		verifyScripts.map(
			(script) =>
				new Promise<{ script: string; code: number }>((resolve) => {
					const child = spawn("npm", ["run", script], {
						stdio: "inherit",
						shell: true,
						cwd: packageDir,
					});
					child.on("close", (code) => {
						resolve({ script, code: code ?? 1 });
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
