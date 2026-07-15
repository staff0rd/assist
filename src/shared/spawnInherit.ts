import { type ChildProcess, spawn } from "node:child_process";

export type SpawnResult = { child: ChildProcess; done: Promise<number> };

export function spawnInherit(
	command: string,
	args: string[],
	options: { cwd?: string } = {},
): SpawnResult {
	const {
		ASSIST_ACTIVITY_ID: _activityId,
		CLAUDE_CODE_CHILD_SESSION: _childSession,
		...env
	} = process.env;
	const child = spawn(command, args, {
		stdio: "inherit",
		env,
		cwd: options.cwd,
	});
	const done = new Promise<number>((resolve, reject) => {
		child.on("close", (code) => resolve(code ?? 0));
		child.on("error", reject);
	});
	return { child, done };
}
