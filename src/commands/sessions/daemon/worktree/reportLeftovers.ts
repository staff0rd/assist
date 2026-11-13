import { homedir } from "node:os";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { sessionBase } from "../sessionBase";
import type { SpawnSession } from "../types";
import type { Leftover } from "./Leftover";
import { noticeContent } from "./noticeContent";

/** Keep exactly one leftover notice in sessions: update it in place, create it
 * via the ceiling-exempt spawner, or drop it once nothing is left. */
export function reportLeftovers(
	sessions: Map<string, Session>,
	spawnNotice: SpawnSession,
	leftovers: Leftover[],
	notify: () => void,
): void {
	const existing = [...sessions.values()].find((s) => s.leftoverNotice);
	if (leftovers.length === 0) {
		if (!existing) return;
		sessions.delete(existing.id);
		daemonLog(
			`leftover notice ${existing.id} dropped: every listed leftover is gone`,
		);
		notify();
		return;
	}
	const content = noticeContent(leftovers);
	if (existing) {
		Object.assign(existing, content);
		daemonLog(
			`leftover notice ${existing.id} updated: ${leftovers.length} leftover(s)`,
		);
		notify();
		return;
	}
	try {
		const id = spawnNotice((sid) => ({
			...sessionBase(sid, "error"),
			...content,
			commandType: "assist",
			pty: null,
			cwd: homedir(),
			leftoverNotice: true,
		}));
		daemonLog(`leftover notice ${id} created: ${leftovers.length} leftover(s)`);
	} catch (error) {
		daemonLog(
			`leftover notice could not be created for ${leftovers.length} leftover(s): ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
