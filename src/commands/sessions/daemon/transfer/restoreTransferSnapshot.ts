import { daemonLog } from "../daemonLog";
import { git, gitOrNull, gitResult } from "../worktree/git";
import { remoteDefaultBranch } from "../worktree/remoteDefaultBranch";
import type { TransferSnapshot } from "./TransferSnapshot";

const FETCH_TIMEOUT_MS = 120_000;

async function switchToSnapshot(
	path: string,
	snapshot: TransferSnapshot,
	sha: string,
): Promise<string> {
	const { branch } = snapshot;
	if (!branch || branch === (await remoteDefaultBranch(path))) {
		await git(path, ["reset", "--hard", "--quiet", sha]);
		return (await gitOrNull(path, ["symbolic-ref", "--short", "HEAD"])) ?? sha;
	}
	await git(path, ["checkout", "--quiet", "-B", branch, sha]);
	return branch;
}

async function trackUpstream(path: string, upstream: string): Promise<void> {
	await gitResult(path, ["fetch", "--quiet", "origin", upstream]);
	const tracked = await gitResult(path, [
		"branch",
		`--set-upstream-to=origin/${upstream}`,
	]);
	if (!tracked.ok)
		daemonLog(
			`transfer restore ${path}: could not track origin/${upstream}: ${tracked.error}`,
		);
}

export async function restoreTransferSnapshot(
	path: string,
	snapshot: TransferSnapshot,
): Promise<void> {
	if (await gitOrNull(path, ["status", "--porcelain"]))
		throw new Error(`${path} has uncommitted changes`);
	await git(
		path,
		["fetch", "--quiet", "origin", `refs/heads/${snapshot.ref}`],
		FETCH_TIMEOUT_MS,
	);
	const sha = (await git(path, ["rev-parse", "FETCH_HEAD"])).trim();
	const branch = await switchToSnapshot(path, snapshot, sha);
	await git(path, ["reset", "--soft", "--quiet", "HEAD~1"]);
	if (snapshot.upstream) await trackUpstream(path, snapshot.upstream);
	daemonLog(
		`transfer restore ${path}: ${snapshot.ref} restored onto ${branch}${snapshot.upstream ? ` tracking origin/${snapshot.upstream}` : ""}`,
	);
	const deleted = await gitResult(
		path,
		["push", "--no-verify", "--quiet", "origin", "--delete", snapshot.ref],
		FETCH_TIMEOUT_MS,
	);
	daemonLog(
		deleted.ok
			? `transfer restore ${path}: deleted ${snapshot.ref} from origin`
			: `transfer restore ${path}: could not delete ${snapshot.ref} from origin: ${deleted.error}`,
	);
}
