import type { HarnessKind } from "../../../../shared/harnesses";
import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import { createSession } from "../createSession";
import { seedBacklogRunActivity } from "../seedBacklogRunActivity";
import type { SpawnContext } from "../types";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
export type { TreeSpawnContext };

export type CreateSpawnRequest = {
	prompt?: string;
	cwd?: string;
	design?: boolean;
	auto?: boolean;
	harness?: HarnessKind;
	model?: string;
	inPlace?: boolean;
};

export function spawnInTree(
	ctx: TreeSpawnContext,
	{ prompt, cwd, design, auto, harness, model, inPlace }: CreateSpawnRequest,
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
				model,
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
	const id = allocateAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd, holdUntilSeeded) =>
			createAssistSession(sid, assistArgs, resolvedCwd, meta, holdUntilSeeded),
		{ inPlace: meta?.inPlace },
		context,
	);
	void seedBacklogRunActivity(ctx.sessions, ctx.sessions.get(id), ctx.notify);
	return id;
}
