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
