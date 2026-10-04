export type ExecveFn = (
	file: string,
	args: string[],
	env: NodeJS.ProcessEnv,
) => void;

export function resolveExecve(
	platform: NodeJS.Platform = process.platform,
	execve: ExecveFn | undefined = process.execve?.bind(process),
): ExecveFn | null {
	if (platform === "win32") return null;
	return execve ?? null;
}
