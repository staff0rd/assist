export function formatArchiveTimestamp(date: Date = new Date()): string {
	const pad = (n: number): string => n.toString().padStart(2, "0");
	const yyyy = date.getUTCFullYear().toString();
	const mm = pad(date.getUTCMonth() + 1);
	const dd = pad(date.getUTCDate());
	const hh = pad(date.getUTCHours());
	const mi = pad(date.getUTCMinutes());
	const ss = pad(date.getUTCSeconds());
	return `${yyyy}-${mm}-${dd}T${hh}${mi}${ss}Z`;
}
