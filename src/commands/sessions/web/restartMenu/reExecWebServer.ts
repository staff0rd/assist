import { type SpawnSyncReturns, spawnSync } from "node:child_process";

type ExecveFn = (file: string, args: string[], env: NodeJS.ProcessEnv) => void;

type SpawnSyncFn = (
	command: string,
	args: string[],
	options: { stdio: "inherit" },
) => Pick<SpawnSyncReturns<Buffer>, "status">;

export type ReExecDeps = {
	beforeExec?: () => void;
	execveFn?: ExecveFn | null;
	spawnSyncFn?: SpawnSyncFn;
	exit?: (code: number) => void;
};

function resolveExecve(): ExecveFn | null {
	return typeof process.execve === "function"
		? process.execve.bind(process)
		: null;
}

export function reExecWebServer(deps: ReExecDeps = {}): void {
	const {
		beforeExec,
		execveFn = resolveExecve(),
		spawnSyncFn = spawnSync,
		exit = (code: number) => process.exit(code),
	} = deps;
	beforeExec?.();
	if (execveFn) {
		// why: in-place image replacement keeps the new server in the terminal's foreground process group, so it stays interactive (a detached spawn would not)
		execveFn(process.execPath, process.argv, process.env);
		return;
	}
	// why: no execve (e.g. Windows) — a blocking, attached child keeps the terminal in the foreground process group; detaching would leave the terminal dead
	const [, ...args] = process.argv;
	const result = spawnSyncFn(process.execPath, args, { stdio: "inherit" });
	exit(result.status ?? 0);
}
