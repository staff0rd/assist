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

function isPlainObject(val: unknown): val is Record<string, unknown> {
	return val !== null && typeof val === "object" && !Array.isArray(val);
}

function ensureNestedObject(
	current: Record<string, unknown>,
	key: string,
): Record<string, unknown> {
	current[key] = isPlainObject(current[key])
		? { ...(current[key] as Record<string, unknown>) }
		: {};
	return current[key] as Record<string, unknown>;
}

function buildNestedPath(
	root: Record<string, unknown>,
	keys: string[],
): Record<string, unknown> {
	let current = root;
	for (let i = 0; i < keys.length - 1; i++) {
		current = ensureNestedObject(current, keys[i]);
	}
	return current;
}

export function setNestedValue(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
): Record<string, unknown> {
	const keys = path.split(".");
	const result = { ...obj };
	buildNestedPath(result, keys)[keys[keys.length - 1]] = value;
	return result;
}
