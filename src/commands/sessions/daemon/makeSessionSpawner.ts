import type { SessionClient } from "./broadcast";
import { registerSpawnedSession } from "./registerSpawnedSession";
import { sessionLimits } from "./sessionLimits";
import type { OnStatusChange, Session, SpawnSession } from "./types";

export type SessionSpawner = {
	spawn: SpawnSession;
	recoveryCard: SpawnSession;
};

export function makeSessionSpawner(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	counter: { next: number },
	onStatusChange: () => OnStatusChange,
	notify: () => void,
): SessionSpawner {
	const register =
		(allocateId: () => string): SpawnSession =>
		(create, context) =>
			registerSpawnedSession(
				create(allocateId()),
				sessions,
				clients,
				onStatusChange(),
				notify,
				context,
			);
	return {
		spawn: register(() => sessionLimits.nextId(sessions.size, counter)),
		recoveryCard: register(() => sessionLimits.recoveryCardId(counter)),
	};
}
