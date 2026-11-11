import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";

function matchesSearch(entry: ConfigEntry, term: string): boolean {
	return (
		!term ||
		entry.key.toLowerCase().includes(term) ||
		(entry.note?.toLowerCase().includes(term) ?? false)
	);
}

export function filterConfigEntries(
	entries: ConfigEntry[],
	search: string,
	scopes: ReadonlySet<ConfigSource> = new Set(),
): ConfigEntry[] {
	const term = search.trim().toLowerCase();
	if (!term && scopes.size === 0) return entries;
	return entries.filter(
		(entry) =>
			(scopes.size === 0 || scopes.has(entry.source)) &&
			matchesSearch(entry, term),
	);
}
