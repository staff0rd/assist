const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Format a byte count as a human-readable size (e.g. `1.5 MB`). */
export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	let value = bytes;
	let unit = 0;
	while (value >= 1024 && unit < UNITS.length - 1) {
		value /= 1024;
		unit++;
	}
	return `${value.toFixed(1)} ${UNITS[unit]}`;
}
