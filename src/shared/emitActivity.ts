import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { z } from "zod";

export const activitySchema = z.object({
	kind: z.enum(["command", "backlog"]),
	name: z.string().optional(),
	itemId: z.number().optional(),
	itemName: z.string().optional(),
	phase: z.number().optional(),
	totalPhases: z.number().optional(),
	claudeSessionId: z.string().optional(),
	startedAt: z.number(),
});

export type Activity = z.infer<typeof activitySchema>;

export function activityPath(sessionId: string): string {
	return join(homedir(), ".assist", "activity", `activity-${sessionId}.json`);
}

export function emitActivity(activity: Omit<Activity, "startedAt">): void {
	// ASSIST_ACTIVITY_ID is set only on the daemon's direct assist child and is
	// stripped before spawning Claude, so nested assist commands run inside the
	// session can't clobber the owning session's activity file.
	const sessionId = process.env.ASSIST_ACTIVITY_ID;
	if (!sessionId) return;
	const path = activityPath(sessionId);
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

export function removeActivity(sessionId: string): void {
	try {
		rmSync(activityPath(sessionId));
	} catch {
		// Activity file may never have been written; nothing to remove
	}
}
