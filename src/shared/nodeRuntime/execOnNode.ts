import { spawnSync } from "node:child_process";
import type { ExecveFn } from "../../commands/sessions/web/restartMenu/resolveExecve";

export function execOnNode(
	target: string,
	env: NodeJS.ProcessEnv,
	execveFn: ExecveFn | null,
): void {
	const args = process.argv.slice(1);
	if (execveFn) {
		execveFn(target, [target, ...args], env);
		return;
	}
	const result = spawnSync(target, args, { stdio: "inherit", env });
	process.exit(result.status ?? 1);
}
