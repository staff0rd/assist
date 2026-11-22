import type { Session } from "../createSession";
import { runPhaseItemTree } from "../runPhaseItemTree";

export type ClosingTree = {
	path: string;
	removable: boolean;
	itemTree?: string;
};

export function treeUnderClose(session: Session): ClosingTree | undefined {
	const itemTree = runPhaseItemTree(session);
	if (session.worktree)
		return { path: session.worktree.path, removable: true, itemTree };
	if (session.cwd) return { path: session.cwd, removable: false, itemTree };
	return undefined;
}
