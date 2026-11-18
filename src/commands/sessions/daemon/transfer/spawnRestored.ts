import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { SpawnContext } from "../types";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { allocatePreparedAndBind } from "../worktree/allocatePreparedAndBind";
import { confirmTransferredRun } from "./confirmTransferredRun";
import { restoreTransferSnapshot } from "./restoreTransferSnapshot";
import type { TransferSnapshot } from "./TransferSnapshot";

type RestoredSpawn = {
	cwd: string | undefined;
	create: (id: string, resolvedCwd: string | undefined) => Session;
	snapshot: TransferSnapshot;
	traceId?: string;
	inPlace?: boolean;
	afterRestore?: (path: string) => Promise<void>;
};

export async function spawnRestored(
	ctx: TreeSpawnContext,
	discard: (id: string) => void,
	{ cwd, create, snapshot, traceId, inPlace, afterRestore }: RestoredSpawn,
	context?: SpawnContext,
): Promise<string> {
	const trace = `trace=${traceId ?? "none"}`;
	const { id, prepared } = allocatePreparedAndBind(
		ctx,
		cwd,
		create,
		async (path) => {
			if (!path) throw new Error("no working tree to restore into");
			daemonLog(`transfer restore ${path}: fetching ${snapshot.ref} ${trace}`);
			await restoreTransferSnapshot(path, snapshot);
			await afterRestore?.(path);
		},
		{ inPlace },
		context,
	);
	try {
		await prepared;
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(
			`session ${id} transfer restore failed ${trace}: ${reason}; run not started, ${snapshot.ref} left on origin`,
		);
		discard(id);
		throw new Error(`restore failed: ${reason}`);
	}
	daemonLog(`session ${id} transfer restored ${trace}; starting run`);
	await confirmTransferredRun(ctx.sessions, id, trace);
	return id;
}
