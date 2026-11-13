import type { HistoricalSession } from "./parseSessionFile";

type Activity = Pick<HistoricalSession, "timestamp" | "lastActivity">;

function activityTime(session: Activity): number {
	return new Date(session.lastActivity ?? session.timestamp).getTime();
}

export function compareByLastActivity(a: Activity, b: Activity): number {
	return activityTime(b) - activityTime(a);
}
