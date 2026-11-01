import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { pushTransferSnapshot } from "./pushTransferSnapshot";
import type { TransferSnapshot } from "./TransferSnapshot";

export async function snapshotTree(
	s: Session,
	args: string[],
	traceId: string,
): Promise<TransferSnapshot | undefined> {
	const path = s.worktree?.path ?? s.cwd;
	if (!path) return undefined;
	const snapshot = await pushTransferSnapshot(path, args[2], s.worktree?.path);
	daemonLog(
		`session ${s.id} pushed ${path} to ${snapshot.ref} (branch=${snapshot.branch ?? "tree"} upstream=${snapshot.upstream ?? "none"}) trace=${traceId}`,
	);
	return snapshot;
}
