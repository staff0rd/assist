function isTraversable(value: unknown): value is Record<string, unknown> {
	return value !== null && value !== undefined && typeof value === "object";
}

function stepInto(current: unknown, key: string): unknown {
	return isTraversable(current) ? current[key] : undefined;
}

export function getNestedValue(
	obj: Record<string, unknown>,
	path: string,
): unknown {
	let current: unknown = obj;
	for (const key of path.split(".")) current = stepInto(current, key);
	return current;
}
