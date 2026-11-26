import { addPrWorktree } from "./addPrWorktree";
import { composeArgs } from "./composeArgs";
import type { InstancePlan } from "./InstancePlan";
import type { RunCommand } from "./runInheritedCommand";

export async function bringUpInstance(
	run: RunCommand,
	plan: InstancePlan,
	pr: { number: number; sha: string },
	interrupted: () => boolean,
): Promise<void> {
	const abortIfInterrupted = () => {
		if (interrupted()) throw new Error("Interrupted");
	};
	await addPrWorktree(run, plan.repoRoot, pr.number, pr.sha, plan.worktree);
	abortIfInterrupted();
	await run(
		"docker",
		composeArgs(plan.project, plan.composeFile, "up", "-d", "--wait"),
		{ cwd: plan.repoRoot, env: plan.env },
	);
	abortIfInterrupted();
}
