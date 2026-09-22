const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

export function formatReleaseDuration(ms: number): string {
	const span = Math.max(0, ms);
	if (span < MINUTE) return `${Math.round(span / SECOND)}s`;
	if (span < HOUR)
		return `${Math.floor(span / MINUTE)}m${pad(Math.floor((span % MINUTE) / SECOND))}s`;
	if (span < DAY)
		return `${Math.floor(span / HOUR)}h${pad(Math.floor((span % HOUR) / MINUTE))}m`;
	return `${Math.floor(span / DAY)}d${pad(Math.floor((span % DAY) / HOUR))}h`;
}
