import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type Activity = {
	kind: "command" | "backlog";
	name?: string;
	itemId?: number;
	itemName?: string;
	phase?: number;
	totalPhases?: number;
	startedAt: number;
};

export function activityPath(cwd: string, sessionId: string): string {
	return join(cwd, ".assist", `activity-${sessionId}.json`);
}

export function emitActivity(activity: Omit<Activity, "startedAt">): void {
	// ASSIST_ACTIVITY_ID is set only on the daemon's direct assist child and is
	// stripped before spawning Claude, so nested assist commands run inside the
	// session can't clobber the owning session's activity file.
	const sessionId = process.env.ASSIST_ACTIVITY_ID;
	if (!sessionId) return;
	const path = activityPath(process.cwd(), sessionId);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify({ ...activity, startedAt: Date.now() }));
}

export function readActivity(path: string): Activity | undefined {
	try {
		return JSON.parse(readFileSync(path, "utf-8")) as Activity;
	} catch {
		return undefined;
	}
}

export function removeActivity(cwd: string, sessionId: string): void {
	try {
		rmSync(activityPath(cwd, sessionId));
	} catch {
		// Activity file may never have been written; nothing to remove
	}
}
