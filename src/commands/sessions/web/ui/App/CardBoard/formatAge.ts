export function formatAge(sinceMs: number, nowMs: number): string {
	const mins = Math.floor(Math.max(0, nowMs - sinceMs) / 60_000);
	if (mins < 1) return "now";
	if (mins < 60) return `${mins}m`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h`;
	return `${Math.floor(hours / 24)}d`;
}
