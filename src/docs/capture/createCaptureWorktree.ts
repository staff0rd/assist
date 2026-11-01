import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename } from "node:path";

export function createCaptureWorktree(
	repoDir: string,
	env: NodeJS.ProcessEnv,
): string {
	let n = 2;
	while (existsSync(`${repoDir}-${n}`)) n++;
	const path = `${repoDir}-${n}`;
	execFileSync(
		"git",
		["worktree", "add", "--quiet", "-B", basename(path), path],
		{ cwd: repoDir, env, stdio: "ignore" },
	);
	return path;
}
