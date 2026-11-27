import type { RunCommand } from "../runInheritedCommand";
import type { InstanceCheckout } from "./InstanceCheckout";

export async function addCheckoutWorktree(
	run: RunCommand,
	checkout: InstanceCheckout,
): Promise<void> {
	await run("git", ["fetch", "origin", checkout.fetchRef], {
		cwd: checkout.repoRoot,
	});
	await run(
		"git",
		["worktree", "add", "--detach", checkout.dir, checkout.sha],
		{
			cwd: checkout.repoRoot,
		},
	);
}
