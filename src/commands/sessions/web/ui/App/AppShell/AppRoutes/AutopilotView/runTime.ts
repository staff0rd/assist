/** A clock time, prefixed with the day when it isn't today. */
export function runTime(iso: string, now = new Date()): string {
	const at = new Date(iso);
	const time = at.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
	if (at.toDateString() === now.toDateString()) return time;
	const day = at.toLocaleDateString([], {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
	return `${day} ${time}`;
}
