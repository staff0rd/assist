export function clockTime(iso: string): string {
	return new Date(iso).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}
