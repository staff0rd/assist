import { addCheckoutWorktree } from "./checkouts/addCheckoutWorktree";
import { composeArgs } from "./composeArgs";
import type { InstancePlan } from "./InstancePlan";
import type { RunCommand } from "./runInheritedCommand";

export async function bringUpInstance(
	run: RunCommand,
	plan: InstancePlan,
	interrupted: () => boolean,
): Promise<void> {
	const abortIfInterrupted = () => {
		if (interrupted()) throw new Error("Interrupted");
	};
	for (const checkout of plan.checkouts) {
		await addCheckoutWorktree(run, checkout);
		abortIfInterrupted();
	}
	await run(
		"docker",
		composeArgs(plan.project, plan.composeFile, "up", "-d", "--wait"),
		{ cwd: plan.repoRoot, env: plan.env },
	);
	abortIfInterrupted();
}
