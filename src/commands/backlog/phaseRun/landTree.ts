/** The item tree a parallel phase lands on, when this process runs that phase in its own worktree. */
export function landTree(): string | undefined {
	return process.env.ASSIST_PHASE_LAND_TREE || undefined;
}
