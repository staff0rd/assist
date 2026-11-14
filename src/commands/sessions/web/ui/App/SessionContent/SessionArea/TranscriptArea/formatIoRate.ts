const UNITS = ["B/s", "KB/s", "MB/s", "GB/s"] as const;

export function formatIoRate(bytesPerSec: number): string {
	let value = Math.max(0, bytesPerSec);
	let unit = 0;
	while (value >= 1024 && unit < UNITS.length - 1) {
		value /= 1024;
		unit++;
	}
	const digits = unit === 0 || value >= 10 ? 0 : 1;
	return `IO ${value.toFixed(digits)} ${UNITS[unit]}`;
}
