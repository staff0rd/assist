let wake: boolean | undefined;

/** Whether the daemon restarted this run because its parked phases ended. Read once, so the phase agents this run spawns don't inherit it. */
export function isWake(): boolean {
	if (wake === undefined) {
		wake = process.env.ASSIST_BACKLOG_WAKE === "1";
		delete process.env.ASSIST_BACKLOG_WAKE;
	}
	return wake;
}
