export function sliceKey(number: number, path: string): string {
	return `${number}:${path}`;
}

export function keyed(number: number, paths: Iterable<string>): string[] {
	return [...paths].map((path) => sliceKey(number, path));
}

export function unkeyed(number: number, keys: Iterable<string>): Set<string> {
	const prefix = sliceKey(number, "");
	const paths = new Set<string>();
	for (const key of keys)
		if (key.startsWith(prefix)) paths.add(key.slice(prefix.length));
	return paths;
}
