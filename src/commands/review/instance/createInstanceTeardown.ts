import { composeArgs } from "./composeArgs";
import type { InstancePlan } from "./InstancePlan";
import type { RunCommand } from "./runInheritedCommand";

async function attempt(label: string, step: () => Promise<void>) {
	try {
		await step();
	} catch (error) {
		console.error(
			`Warning: ${label} failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export function createInstanceTeardown(
	instance: InstancePlan,
	run: RunCommand,
): () => Promise<void> {
	let done: Promise<void> | undefined;
	const teardown = async () => {
		console.log(`Tearing down ${instance.project}…`);
		await attempt("compose down", () =>
			run(
				"docker",
				composeArgs(instance.project, instance.composeFile, "down", "-v"),
				{ cwd: instance.repoRoot, env: instance.env },
			),
		);
		await attempt("worktree removal", () =>
			run("git", ["worktree", "remove", "--force", instance.worktree], {
				cwd: instance.repoRoot,
			}),
		);
	};
	return () => {
		done ??= teardown();
		return done;
	};
}
