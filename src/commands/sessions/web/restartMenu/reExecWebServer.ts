import { type SpawnOptions, spawn } from "node:child_process";

type SpawnFn = (
	command: string,
	args: string[],
	options: SpawnOptions,
) => { unref(): void };

export type ReExecDeps = {
	beforeExec?: () => void;
	spawnFn?: SpawnFn;
	exit?: (code: number) => void;
};

export function reExecWebServer(deps: ReExecDeps = {}): void {
	const {
		beforeExec,
		spawnFn = spawn,
		exit = (code: number) => process.exit(code),
	} = deps;
	beforeExec?.();
	const [, ...args] = process.argv;
	const child = spawnFn(process.execPath, args, {
		stdio: "inherit",
		detached: true,
	});
	child.unref();
	exit(0);
}
