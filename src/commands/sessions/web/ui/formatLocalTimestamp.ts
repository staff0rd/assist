const localTimestampFormat = new Intl.DateTimeFormat(undefined, {
	weekday: "short",
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
});

export function formatLocalTimestamp(timestamp: string): string {
	return localTimestampFormat.format(new Date(timestamp));
}
