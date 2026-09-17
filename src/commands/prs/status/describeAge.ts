type Age = { hours: number | null; label: string };

export function describeAge(timestamp: string, now: number = Date.now()): Age {
	const parsed = new Date(timestamp).getTime();
	if (Number.isNaN(parsed)) return { hours: null, label: "unknown" };

	const hours = Math.max(0, Math.floor((now - parsed) / 3_600_000));
	if (hours < 1) return { hours, label: "<1h" };
	if (hours < 24) return { hours, label: `${hours}h` };
	return { hours, label: `${Math.floor(hours / 24)}d` };
}
