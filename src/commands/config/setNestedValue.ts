type Container = Record<string, unknown> | unknown[];

function isPlainObject(val: unknown): val is Record<string, unknown> {
	return val !== null && typeof val === "object" && !Array.isArray(val);
}

function isNumericKey(key: string): boolean {
	return /^\d+$/.test(key);
}

function resolveKey(key: string): string | number {
	return isNumericKey(key) ? Number.parseInt(key, 10) : key;
}

function getItem(container: Container, key: string | number): unknown {
	if (Array.isArray(container)) return container[key as number];
	return (container as Record<string, unknown>)[key as string];
}

function setItem(
	container: Container,
	key: string | number,
	value: unknown,
): void {
	if (Array.isArray(container)) container[key as number] = value;
	else (container as Record<string, unknown>)[key as string] = value;
}

function ensureArray(container: Container, key: string | number): unknown[] {
	const existing = getItem(container, key);
	const arr = Array.isArray(existing) ? [...existing] : [];
	setItem(container, key, arr);
	return arr;
}

function ensureObject(
	container: Container,
	key: string | number,
): Record<string, unknown> {
	const existing = getItem(container, key);
	const obj = isPlainObject(existing) ? { ...existing } : {};
	setItem(container, key, obj);
	return obj;
}

function stepIntoNested(
	container: Container,
	key: string,
	nextKey: string | undefined,
): Container {
	const resolved = resolveKey(key);
	if (nextKey !== undefined && isNumericKey(nextKey)) {
		return ensureArray(container, resolved);
	}
	return ensureObject(container, resolved);
}

export function setNestedValue(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
): Record<string, unknown> {
	const keys = path.split(".");
	const result = { ...obj };
	let current: Container = result;

	for (let i = 0; i < keys.length - 1; i++) {
		current = stepIntoNested(current, keys[i], keys[i + 1]);
	}

	setItem(current, resolveKey(keys[keys.length - 1]), value);
	return result;
}
