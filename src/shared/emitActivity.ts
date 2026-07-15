import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { z } from "zod";

export const activitySchema = z.object({
	kind: z.enum(["command", "backlog"]),
	harness: z.enum(["claude", "codex", "pi"]).optional(),
	name: z.string().optional(),
	itemId: z.number().optional(),
	itemName: z.string().optional(),
	phase: z.number().optional(),
	phaseName: z.string().optional(),
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
		return JSON.parse(readFileSync(path, "utf8")) as Activity;
	} catch {
		return undefined;
	}
}

/* why: on daemon restart session ids are reused (nextId resets to 1), so a stale
 * activity file from a prior generation can sit at a restored session's id and
 * misreport it as a different backlog item (#408). Align the file with the
 * session's own activity, or remove it when the session has none. */
export function reconcileActivity(
	sessionId: string,
	activity: Activity | undefined,
): void {
	if (!activity) {
		removeActivity(sessionId);
		return;
	}
	const path = activityPath(sessionId);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(activity));
}

export function removeActivity(sessionId: string): void {
	try {
		rmSync(activityPath(sessionId));
	} catch {
		// Activity file may never have been written; nothing to remove
	}
}
