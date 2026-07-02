import { existsSync, mkdirSync, watch } from "node:fs";
import { dirname } from "node:path";
import {
	activityPath,
	readActivity,
	reconcileActivity,
} from "../../../shared/emitActivity";
import type { Session } from "./createSession";
import { applyReviewPause } from "./applyReviewPause";
import { seedRunningMsFromUsage } from "./seedRunningMsFromUsage";

const DEBOUNCE_MS = 50;

export function watchActivity(session: Session, notify: () => void): void {
	if (session.commandType !== "assist" || !session.cwd) return;
	const path = activityPath(session.id);
	const dir = dirname(path);
	try {
		// The activity file may not exist yet, so watch the containing .assist
		// directory and ensure it exists first
		mkdirSync(dir, { recursive: true });
	} catch {
		return;
	}

	/* why: a restored session inherits a reused id whose activity file may belong
	 * to a different session from the previous daemon generation. Seed the file
	 * from this session's own restored activity so the read below shows its own
	 * details, not another backlog item's (#408). */
	reconcileActivity(session.id, session.activity);

	let timer: ReturnType<typeof setTimeout> | null = null;
	const read = () => {
		timer = null;
		const activity = readActivity(path);
		if (!activity) return;
		session.activity = activity;
		/* why: a backlog run reports its current phase's Claude session id here, so
		 * the daemon persists the latest phase's id and can resume it on restart. */
		if (activity.claudeSessionId)
			session.claudeSessionId = activity.claudeSessionId;
		applyReviewPause(session, activity);
		void seedRunningMsFromUsage(session, notify);
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
	const activity = readActivity(activityPath(session.id));
	if (!activity) return;
	session.activity = activity;
	if (activity.claudeSessionId)
		session.claudeSessionId = activity.claudeSessionId;
}
