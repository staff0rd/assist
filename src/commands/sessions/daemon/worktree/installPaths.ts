import { resolve } from "node:path";
import { daemonLog } from "../daemonLog";
import { enclosingPaths } from "./enclosingPaths";
import { type PathState, pendingPathAction } from "./pendingPathAction";
import { startPathInstall } from "./startPathInstall";

export function installPaths(
	worktreePath: string,
	paths: string[],
	onSeeded: () => void,
	onInstalling: (path?: string) => void,
): void {
	const dirs = paths.map((rel) => resolve(worktreePath, rel));
	const enclosing = enclosingPaths(dirs);
	const states: PathState[] = paths.map(() => "pending");
	let stopped = false;

	const pump = (): void => {
		for (let i = 0; i < paths.length; i++) {
			if (states[i] !== "pending") continue;
			const action = pendingPathAction(enclosing[i], states, paths, stopped);
			if (action.kind === "start")
				states[i] = startPathInstall(
					worktreePath,
					paths[i],
					dirs[i],
					(ok, wasStopped) => {
						states[i] = ok ? "ok" : "failed";
						stopped ||= wasStopped;
						pump();
					},
				);
			if (action.kind !== "skip") continue;
			states[i] = "skipped";
			daemonLog(
				`worktree ${worktreePath} install skipping ${paths[i]}: ${action.reason}`,
			);
		}
		const running = paths.filter((_, i) => states[i] === "running");
		if (running.length > 0) onInstalling(running.join(", "));
		else if (!states.includes("pending")) onSeeded();
	};

	pump();
}
