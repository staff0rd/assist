import { basename } from "node:path";
import { getCachedOrigin } from "../../../backlog/getCachedOrigin";
import { daemonLog } from "../daemonLog";
import { git, gitResult } from "./git";
import { recordWorktree } from "./readWorktreeRegistry";
import { worktreeStartPoint } from "./worktreeStartPoint";

const FETCH_TIMEOUT_MS = 60_000;

export async function addWorktree(
	clone: string,
	path: string,
	trunk: boolean,
	startPoint?: string,
): Promise<void> {
	const fetched = await gitResult(
		clone,
		["fetch", "--quiet"],
		FETCH_TIMEOUT_MS,
	);
	if (!fetched.ok)
		daemonLog(
			`fetch before allocating a worktree for clone ${clone} failed, branching off local refs: ${fetched.error}`,
		);
	const start = startPoint
		? { ref: startPoint, track: false }
		: await worktreeStartPoint(clone, trunk);
	await git(clone, [
		"worktree",
		"add",
		start.track ? "--track" : "--no-track",
		"-b",
		basename(path),
		path,
		start.ref,
	]);
	recordWorktree(path, clone, getCachedOrigin(clone));
	daemonLog(
		start.track
			? `worktree allocated ${path} (branch ${basename(path)} tracking ${start.ref}) for clone ${clone}`
			: `worktree allocated ${path} (branch ${basename(path)} off ${start.ref}, no mainline tracking) for clone ${clone}`,
	);
}
