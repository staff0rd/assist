import type { Session } from "../createSession";
import { snapshotTree } from "./snapshotTree";
import type { TransferSnapshot } from "./TransferSnapshot";

type SnapshotResult =
	| { ok: true; snapshot: TransferSnapshot | undefined }
	| { ok: false; error: string };

export async function snapshotOrFail(
	s: Session,
	args: string[],
	traceId: string,
): Promise<SnapshotResult> {
	try {
		return { ok: true, snapshot: await snapshotTree(s, args, traceId) };
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		return { ok: false, error: `push failed: ${reason}` };
	}
}
