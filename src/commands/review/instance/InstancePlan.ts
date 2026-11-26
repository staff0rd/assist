export type InstancePlan = {
	project: string;
	composeFile: string;
	repoRoot: string;
	worktree: string;
	env: Record<string, string>;
};
