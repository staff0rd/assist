import type { ConfigEntry } from "../../../../../../../config/readConfigEntries";

export type ConfigGroup = {
	name: string;
	entries: ConfigEntry[];
};

const TOP_LEVEL_GROUP = "general";

function groupName(key: string): string {
	return key.includes(".") ? key.split(".")[0] : TOP_LEVEL_GROUP;
}

export function groupConfigEntries(entries: ConfigEntry[]): ConfigGroup[] {
	const groups = new Map<string, ConfigEntry[]>();
	for (const entry of entries) {
		const name = groupName(entry.key);
		const existing = groups.get(name);
		if (existing) existing.push(entry);
		else groups.set(name, [entry]);
	}
	return [...groups.entries()]
		.map(([name, grouped]) => ({ name, entries: grouped }))
		.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
