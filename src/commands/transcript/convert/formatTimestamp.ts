function pad(value: number, width: number): string {
	return String(value).padStart(width, "0");
}

export function formatTimestamp(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms % 1000, 3)}`;
}

export function formatClock(ms: number): string {
	return formatTimestamp(ms).slice(0, 8);
}
