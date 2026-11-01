const STORAGE_KEY = "assist:group-order";
const MAX_KEYS = 200;

let memory: string[] | null = null;

function load(): string[] {
	if (memory) return memory;
	try {
		const parsed: unknown = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? "[]",
		);
		memory = Array.isArray(parsed)
			? parsed.filter((key): key is string => typeof key === "string")
			: [];
	} catch {
		memory = [];
	}
	return memory;
}

function save(order: string[]): void {
	memory = order;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
	} catch {}
}

function trim(order: string[], present: Set<string>): string[] {
	let excess = order.length - MAX_KEYS;
	if (excess <= 0) return order;
	return order.filter((key) => present.has(key) || excess-- <= 0);
}

function rank(keys: string[]): Map<string, number> {
	const known = load();
	const unseen = keys.filter((key) => !known.includes(key));
	const order =
		unseen.length > 0 ? trim([...known, ...unseen], new Set(keys)) : known;
	if (order !== known) save(order);
	return new Map(order.map((key, index) => [key, index]));
}

function clear(): void {
	memory = null;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {}
}

export const groupOrderStore = { rank, clear };
