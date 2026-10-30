import { getDb } from "../../shared/db/getDb";
import type { ConfigEntry } from "./ConfigEntry";
import { dbBackedConfigKeys, isDbBackedConfigKey } from "./dbBackedConfigKeys";
import { dbBackedKeysIn } from "./withDbBackedConfigValues";

function dbBackedEntry(entry: ConfigEntry, value: unknown): ConfigEntry {
	const set = value !== undefined;
	return {
		...entry,
		value: set ? value : entry.defaultValue,
		source: set ? "user" : "default",
		sources: set ? ["user"] : [],
		layers: set ? { user: value } : {},
		writableScopes: ["user"],
	};
}

export async function withDbBackedConfigEntries(
	entries: ConfigEntry[],
): Promise<ConfigEntry[]> {
	if (dbBackedKeysIn().length === 0) return entries;
	const db = await getDb();
	return Promise.all(
		entries.map(async (entry) =>
			isDbBackedConfigKey(entry.key)
				? dbBackedEntry(entry, await dbBackedConfigKeys[entry.key].read(db))
				: entry,
		),
	);
}
