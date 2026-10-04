import { createAssistSession } from "./createAssistSession";
import type { Session } from "./types";

export const WATCHER_ARGS = ["watch", "loop"];

export function createWatcherSession(id: string, cwd: string): Session {
	return {
		...createAssistSession(id, WATCHER_ARGS, cwd),
		watcher: true,
	};
}
