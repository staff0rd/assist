import { basename } from "node:path";
import type { HarnessKind } from "../../../../shared/harnesses";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { sessionBase } from "../sessionBase";
import type { SpawnSession } from "../types";
import type { HeldWork } from "./describeHeldWork";
import { armStoppedSession } from "./rearmStoppedSessions";

export type OrphanedWorktree = {
	path: string;
	clone: string;
	harness?: HarnessKind;
};

type RecoveredWorkspace = {
	orphan: OrphanedWorktree;
	reason: string;
	held: HeldWork;
};

export function resurfaceOrphanedWorktree(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	recovered: RecoveredWorkspace,
	notify: () => void,
): void {
	const { orphan, reason, held } = recovered;
	let id: string;
	try {
		id = spawnWith((sid) => orphanedSession(sid, recovered));
	} catch (error) {
		daemonLog(
			`orphaned worktree ${orphan.path} left in place, no card available: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
	daemonLog(
		`orphaned worktree ${orphan.path} resurfaced as stopped ${sessions.get(id)?.harness ?? "unknown-harness"} session ${id}: ${reason} (${held.summary})`,
	);
	const session = sessions.get(id);
	if (session) armStoppedSession(sessions, session, notify);
	notify();
}

function orphanedSession(id: string, recovered: RecoveredWorkspace): Session {
	const { orphan, reason, held } = recovered;
	return {
		...sessionBase(id, "stopped"),
		name: `recovered ${basename(orphan.path)}`,
		subtitle: `${held.summary} in ${orphan.path}`,
		commandType: "claude",
		harness: orphan.harness ?? loadConfigFrom(orphan.clone).harness.engine,
		pty: null,
		cwd: orphan.path,
		worktree: { path: orphan.path, clone: orphan.clone },
		undurable: { reason, removesTree: true },
		scrollback: recoveryNotice(recovered),
	};
}

function recoveryNotice({ orphan, held }: RecoveredWorkspace): string {
	return [
		`\r\n\x1b[33mRecovered workspace ${orphan.path}\x1b[0m\r\n`,
		`Its session is gone, but the workspace still holds ${held.summary}:\r\n`,
		...held.items.map((item) => `  ${item}\r\n`),
		"\r\nThis card is the handle for it: land the work and the workspace is removed on its own,\r\n",
		"restart to put an agent back in it, or discard to delete it and the work it holds.\r\n",
	].join("");
}
