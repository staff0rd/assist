import { basename } from "node:path";
import { parseItemId } from "../formatItemId";

export function parseStoryMappings(values: string[]): Map<number, string[]> {
	const mappings = new Map<number, string[]>();
	for (const value of values) {
		const eq = value.indexOf("=");
		const file = eq === -1 ? "" : value.slice(eq + 1).trim();
		if (!file) throw new Error(`--story ${value}: expected <id>=<file.png>`);
		const id = parseItemId(value.slice(0, eq));
		mappings.set(id, [...(mappings.get(id) ?? []), basename(file)]);
	}
	return mappings;
}
