import type { HarnessKind } from "../../../../shared/harnesses";
import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import { createSession } from "../createSession";
import type { SpawnContext } from "../types";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { isBacklogRunArgs } from "./isBacklogRunArgs";
import { isCommittingArgs } from "./isCommittingArgs";
import { isPrCheckoutArgs } from "./isPrCheckoutArgs";
export type { TreeSpawnContext };

export type CreateSpawnRequest = {
	prompt?: string;
	cwd?: string;
	design?: boolean;
	auto?: boolean;
	harness?: HarnessKind;
	inPlace?: boolean;
};

export function spawnInTree(
	ctx: TreeSpawnContext,
	{ prompt, cwd, design, auto, harness, inPlace }: CreateSpawnRequest,
	context?: SpawnContext,
): string {
	return allocateAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd, holdUntilSeeded) =>
			createSession(sid, {
				prompt,
				cwd: resolvedCwd,
				design,
				auto,
				harness,
				holdPty: holdUntilSeeded,
			}),
		{ inPlace },
		context,
	);
}

export function spawnAssistInTree(
	ctx: TreeSpawnContext,
	assistArgs: string[],
	cwd: string | undefined,
	meta: AssistSessionMeta | undefined,
	context?: SpawnContext,
): string {
	return allocateAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd, holdUntilSeeded) =>
			createAssistSession(sid, assistArgs, resolvedCwd, meta, holdUntilSeeded),
		{
			forCheckout: isPrCheckoutArgs(assistArgs),
			commits: isCommittingArgs(assistArgs),
			backlogRun: isBacklogRunArgs(assistArgs),
			assistCommand: assistArgs[0] ?? "",
			inPlace: meta?.inPlace,
		},
		context,
	);
}
