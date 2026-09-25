export function asConfigRecord(
	value: unknown,
): Record<string, unknown> | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value))
		return undefined;
	return value as Record<string, unknown>;
}
