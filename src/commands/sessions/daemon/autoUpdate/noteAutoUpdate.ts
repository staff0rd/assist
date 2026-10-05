import { daemonLog } from "../daemonLog";
import { watcherNote } from "../watcherNote";
import { appendWatcherLog } from "../worktree/appendWatcherLog";

export function noteAutoUpdate(installDir: string, text: string): void {
	appendWatcherLog(installDir, watcherNote(text));
	daemonLog(`auto-update: ${text}`);
}
