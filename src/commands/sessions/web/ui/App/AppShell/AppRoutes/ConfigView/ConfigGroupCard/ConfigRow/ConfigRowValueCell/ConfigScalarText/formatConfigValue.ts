export function formatConfigValue(value: unknown): string {
	if (typeof value === "object" && value !== null) {
		return JSON.stringify(value, null, 2);
	}
	return String(value);
}
