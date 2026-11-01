import type { Session } from "../createSession";
import type { SpawnContext } from "../types";
import type { TreeSpawnContext } from "./allocateAndBind";
import { type AllocateOptions, allocateTree } from "./allocateTree";
import { bindNewWorktree } from "./bindNewWorktree";
import { boundTreeRoots } from "./boundTreeRoots";

type Prepare = (cwd: string | undefined) => Promise<void>;

export function allocatePreparedAndBind(
	ctx: TreeSpawnContext,
	cwd: string | undefined,
	create: (id: string, resolvedCwd: string | undefined) => Session,
	prepare: Prepare,
	options: AllocateOptions = {},
	context?: SpawnContext,
): { id: string; prepared: Promise<void> } {
	const alloc = allocateTree(cwd, boundTreeRoots(ctx.sessions), options);
	const prepared = (alloc.ready ?? Promise.resolve()).then(() =>
		prepare(alloc.cwd),
	);
	prepared.catch(() => {});
	const id = ctx.spawnWith((sid) => create(sid, alloc.cwd), context);
	const session = ctx.sessions.get(id);
	bindNewWorktree(
		session,
		{ ...alloc, ready: prepared },
		ctx.notify,
		ctx.startHeld,
	);
	if (session && !alloc.created)
		prepared.then(
			() => ctx.startHeld(session),
			() => {},
		);
	return { id, prepared };
}
