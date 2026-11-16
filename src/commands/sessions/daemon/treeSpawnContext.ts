import type { SessionClient } from "./broadcast";
import { startHeldInTree } from "./startHeldInTree";
import type { OnStatusChange, Session, SpawnSession } from "./types";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

export function treeSpawnContext(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	notify: () => void,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): TreeSpawnContext {
	return {
		sessions,
		spawnWith,
		notify,
		startHeld: (session, failure) =>
			startHeldInTree(
				session,
				sessions,
				clients,
				onStatusChange,
				notify,
				failure,
			),
	};
}
