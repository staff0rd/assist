import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import chalk from "chalk";
import { expandTilde } from "../../shared/expandTilde";
import { loadConfig } from "../../shared/loadConfig";
import { cloneTargetDir } from "./cloneTargetDir";
import { normalizeOrigin } from "./getCurrentOrigin";
import { originToSshUrl } from "./originToSshUrl";

function fail(message: string): void {
	console.log(chalk.red(message));
	process.exitCode = 1;
}

export async function cloneRepo(originRaw: string): Promise<void> {
	if (originRaw.trim().startsWith("local:")) {
		return fail(
			`"${originRaw.trim()}" has no remote and cannot be cloned (local: origins are not clonable).`,
		);
	}

	const origin = normalizeOrigin(originRaw);
	const sshUrl = originToSshUrl(origin);
	if (!sshUrl) {
		return fail(`Could not derive an SSH remote from "${origin}".`);
	}

	const baseDir = expandTilde(loadConfig().clone.baseDir);
	const target = cloneTargetDir(origin, baseDir);
	if (!target) {
		return fail(`Could not derive a repository name from "${origin}".`);
	}

	if (existsSync(target)) {
		return fail(`Clone target already exists: ${target}`);
	}

	await mkdir(baseDir, { recursive: true });

	console.error(chalk.dim(`Cloning ${sshUrl} into ${target}`));
	const result = spawnSync("git", ["clone", sshUrl, target], {
		stdio: "inherit",
	});

	if (result.error) {
		return fail(`Failed to run git clone: ${result.error.message}`);
	}
	if (result.status !== 0) {
		return fail(
			`git clone failed with exit code ${result.status ?? "unknown"}.`,
		);
	}

	console.error(chalk.green(`Cloned ${origin} into ${target}`));
}
