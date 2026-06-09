import { existsSync, mkdirSync, watch } from "node:fs";
import { dirname } from "node:path";
import { activityPath, readActivity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";

const DEBOUNCE_MS = 50;

export function watchActivity(session: Session, notify: () => void): void {
	if (session.commandType !== "assist" || !session.cwd) return;
	const path = activityPath(session.cwd, session.id);
	const dir = dirname(path);
	try {
		// The activity file may not exist yet, so watch the containing .assist
		// directory and ensure it exists first
		mkdirSync(dir, { recursive: true });
	} catch {
		return;
	}

	let timer: ReturnType<typeof setTimeout> | null = null;
	const read = () => {
		timer = null;
		const activity = readActivity(path);
		if (!activity) return;
		session.activity = activity;
		notify();
	};

	session.activityWatcher = watch(dir, (_event, filename) => {
		if (filename && !path.endsWith(filename)) return;
		if (timer) clearTimeout(timer);
		timer = setTimeout(read, DEBOUNCE_MS);
	});

	if (existsSync(path)) read();
}

/**
 * Synchronously load the latest activity into the session, bypassing the
 * watcher's debounce. A launch session writes its final activity (the created
 * item id) microseconds before exiting, so the pty `onExit` handler must read
 * it directly — the debounced watcher would otherwise lose the race and the
 * auto-run decision would see stale activity with no itemId.
 */
export function refreshActivity(session: Session): void {
	if (session.commandType !== "assist" || !session.cwd) return;
	const activity = readActivity(activityPath(session.cwd, session.id));
	if (activity) session.activity = activity;
}
