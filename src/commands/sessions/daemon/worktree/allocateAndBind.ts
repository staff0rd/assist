import type { Session } from "../createSession";
import type { SpawnContext, SpawnSession } from "../types";
import { type AllocateOptions, allocateTree } from "./allocateTree";
import { bindNewWorktree } from "./bindNewWorktree";
import { boundTreeRoots } from "./boundTreeRoots";

export type TreeSpawnContext = {
	sessions: Map<string, Session>;
	spawnWith: SpawnSession;
	notify: () => void;
	startHeld: (session: Session, failure?: string) => void;
};

export function allocateAndBind(
	ctx: TreeSpawnContext,
	cwd: string | undefined,
	create: (
		id: string,
		resolvedCwd: string | undefined,
		holdUntilSeeded: boolean,
	) => Session,
	options: AllocateOptions = {},
	context?: SpawnContext,
): string {
	const alloc = allocateTree(cwd, boundTreeRoots(ctx.sessions), options);
	const needsSeeding = alloc.kind === "worktree" && alloc.created === true;
	const id = ctx.spawnWith(
		(sid) => create(sid, alloc.cwd, needsSeeding),
		context,
	);
	bindNewWorktree(ctx.sessions.get(id), alloc, ctx.notify, ctx.startHeld);
	return id;
}
