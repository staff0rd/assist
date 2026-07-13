const peakTimestampFormat = new Intl.DateTimeFormat(undefined, {
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

export function formatPeakTimestamp(date: Date): string {
	return peakTimestampFormat.format(date);
}
