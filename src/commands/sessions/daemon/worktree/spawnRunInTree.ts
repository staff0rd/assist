import type { Session } from "../createSession";
import { createRunSession, type RunSpawnRequest } from "../createRunSession";
import type { SpawnContext, SpawnSession } from "../types";
import { holdRunUntilSeeded } from "./holdRunUntilSeeded";
import { seedingTreeFor } from "./seedingTreeFor";

export function spawnRunInTree(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	request: RunSpawnRequest,
	context?: SpawnContext,
): string {
	const tree = seedingTreeFor(sessions, request.cwd);
	const id = spawnWith(
		(sid) => createRunSession(sid, request, tree !== undefined),
		context,
	);
	const run = sessions.get(id);
	if (tree && run) holdRunUntilSeeded(run, tree);
	return id;
}
