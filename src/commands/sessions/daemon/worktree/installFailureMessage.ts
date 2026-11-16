import type { InstallFailure } from "./SeedOutcome";

export function installFailureMessage(
	worktreePath: string,
	{ path, reason, output }: InstallFailure,
): string {
	const where = path ? ` in ${path}` : "";
	const tail = output ? `:\n${output}` : "";
	return `worktree ${worktreePath} install${where} failed (${reason})${tail}`;
}
