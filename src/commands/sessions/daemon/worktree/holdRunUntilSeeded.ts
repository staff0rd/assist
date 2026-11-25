import { basename } from "node:path";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function holdRunUntilSeeded(run: Session, tree: Session): void {
	const worktree = tree.worktree;
	if (!worktree) return;
	run.worktree = { ...worktree };
	run.awaitingSeed = true;
	const { install } = worktreeConfigFor(worktree.clone);
	const dirs =
		Array.isArray(install) && install.length > 0
			? ` in ${install.join(", ")}`
			: "";
	run.seeding = `Waiting for ${basename(worktree.path)} to finish installing dependencies${dirs}…`;
	daemonLog(
		`session ${run.id} ("${run.name}") held until worktree ${worktree.path} finishes seeding (session ${tree.id})`,
	);
}
