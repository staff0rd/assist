import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import { daemonLog } from "../daemonLog";
import type { SpawnContext } from "../types";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { allocatePreparedAndBind } from "../worktree/allocatePreparedAndBind";
import { confirmTransferredRun } from "./confirmTransferredRun";
import { restoreTransferSnapshot } from "./restoreTransferSnapshot";
import type { TransferSnapshot } from "./TransferSnapshot";

type TransferredRun = {
	assistArgs: string[];
	cwd: string | undefined;
	meta: AssistSessionMeta;
	snapshot: TransferSnapshot;
	traceId?: string;
};

export async function spawnTransferredRun(
	ctx: TreeSpawnContext,
	discard: (id: string) => void,
	{ assistArgs, cwd, meta, snapshot, traceId }: TransferredRun,
	context?: SpawnContext,
): Promise<string> {
	const trace = `trace=${traceId ?? "none"}`;
	const { id, prepared } = allocatePreparedAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd) =>
			createAssistSession(sid, assistArgs, resolvedCwd, meta, true),
		async (path) => {
			if (!path) throw new Error("no working tree to restore into");
			daemonLog(`transfer restore ${path}: fetching ${snapshot.ref} ${trace}`);
			await restoreTransferSnapshot(path, snapshot);
		},
		{ inPlace: meta.inPlace },
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
