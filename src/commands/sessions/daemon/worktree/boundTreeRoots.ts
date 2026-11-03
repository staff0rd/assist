import { findRepoRoot } from "../../../../shared/findRepoRoot";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { canonicalTreePath } from "./canonicalTreePath";
import { checkDurabilitySync, type Durability } from "./treeDurability";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function boundTreeRoots(
	sessions: Map<string, Session>,
	exclude?: Session,
): Set<string> {
	const roots = new Set<string>();
	for (const session of sessions.values()) {
		if (session === exclude) continue;
		const root = treeRootOf(session);
		if (root && !roots.has(root) && holdsTree(session, root)) roots.add(root);
	}
	return roots;
}

function treeRootOf(session: Session): string | undefined {
	if (!session.cwd) return undefined;
	return canonicalTreePath(findRepoRoot(session.cwd) ?? session.cwd);
}

function holdsTree(session: Session, root: string): boolean {
	if (session.closing) return true;
	if (session.status !== "done" && session.status !== "error") return true;
	if (!worktreeConfigFor(root).enabled) return true;
	const durability = checkDurabilitySync(root);
	daemonLog(`tree ${root} ${releaseReason(durability, session)}`);
	return !durability.durable;
}

function releaseReason(durability: Durability, session: Session): string {
	if (!durability.durable)
		return `still held by finished session ${session.id}: ${durability.reason}`;
	if (durability.gone)
		return `free for allocation: session ${session.id}'s directory is gone from disk or holds no git checkout — nothing to land, not landed work`;
	return `free for allocation: session ${session.id} finished and its work is landed`;
}
