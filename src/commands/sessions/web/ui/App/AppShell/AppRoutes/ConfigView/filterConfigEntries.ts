import type { ConfigEntry } from "../../../../../../../config/readConfigEntries";

export function filterConfigEntries(
	entries: ConfigEntry[],
	search: string,
): ConfigEntry[] {
	const term = search.trim().toLowerCase();
	if (!term) return entries;
	return entries.filter(
		(entry) =>
			entry.key.toLowerCase().includes(term) ||
			(entry.note?.toLowerCase().includes(term) ?? false),
	);
}
