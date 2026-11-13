import { basename } from "node:path";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { sessionBase } from "../sessionBase";
import type { SpawnSession } from "../types";
import { forgetWorktree } from "./readWorktreeRegistry";
import { leftoverSurfacingEnabled } from "./leftoverSurfacingEnabled";
import type { OrphanedWorktree } from "./resurfaceOrphanedWorktree";

type UndeletableLeftover = OrphanedWorktree & { reason: string };

export function surfaceUndeletableLeftover(
	spawnWith: SpawnSession,
	leftover: UndeletableLeftover,
	notify: () => void,
): void {
	if (!leftoverSurfacingEnabled) return;
	forgetWorktree(leftover.path);
	try {
		const id = spawnWith((sid) => leftoverSession(sid, leftover));
		daemonLog(
			`worktree ${leftover.path} could not be deleted; surfaced as error card ${id} until it is removed by hand: ${leftover.reason}`,
		);
	} catch (error) {
		daemonLog(
			`worktree ${leftover.path} could not be deleted and no card was available to surface it: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
	notify();
}

function leftoverSession(id: string, leftover: UndeletableLeftover): Session {
	const message = `Leftover workspace ${leftover.path} could not be deleted: ${leftover.reason}`;
	return {
		...sessionBase(id, "error"),
		name: `leftover ${basename(leftover.path)}`,
		subtitle: message,
		commandType: "claude",
		harness: leftover.harness ?? loadConfigFrom(leftover.clone).harness.engine,
		pty: null,
		cwd: leftover.path,
		error: message,
		scrollback: [
			`\r\n\x1b[31m${message}\x1b[0m\r\n`,
			"\r\nIts worktree is gone, but the directory is still on disk. Remove it with the command above,\r\n",
			"then dismiss this card. If it is still there on the next daemon restart, this card returns.\r\n",
		].join(""),
	};
}
