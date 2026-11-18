import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import type { SpawnContext } from "../types";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { spawnRestored } from "./spawnRestored";
import type { TransferSnapshot } from "./TransferSnapshot";

type TransferredRun = {
	assistArgs: string[];
	cwd: string | undefined;
	meta: AssistSessionMeta;
	snapshot: TransferSnapshot;
	traceId?: string;
};

export function spawnTransferredRun(
	ctx: TreeSpawnContext,
	discard: (id: string) => void,
	{ assistArgs, cwd, meta, snapshot, traceId }: TransferredRun,
	context?: SpawnContext,
): Promise<string> {
	return spawnRestored(
		ctx,
		discard,
		{
			cwd,
			create: (sid, resolvedCwd) =>
				createAssistSession(sid, assistArgs, resolvedCwd, meta, true),
			snapshot,
			traceId,
			inPlace: meta.inPlace,
		},
		context,
	);
}
