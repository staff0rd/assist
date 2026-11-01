import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { treeUnderClose } from "./worktree/treeUnderClose";

function isChildServerRun(child: Session, parent: Session): boolean {
	if (!child.server || child.id === parent.id) return false;
	if (child.launchedFrom === parent.id) return true;
	return (
		!!parent.worktree && treeUnderClose(child)?.path === parent.worktree.path
	);
}

export function closeChildServerRuns(
	sessions: Map<string, Session>,
	parentId: string,
	close: (id: string) => void,
): void {
	const parent = sessions.get(parentId);
	if (!parent) return;
	const children = [...sessions.values()].filter((s) =>
		isChildServerRun(s, parent),
	);
	for (const child of children) {
		daemonLog(`closing server run ${child.id} with ${parentId}`);
		close(child.id);
	}
}
