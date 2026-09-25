import type { ConfigEntry } from "../../../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../../../config/resolveConfigSources";

export function configEntrySources(entry: ConfigEntry): ConfigSource[] {
	if (entry.sources) return entry.sources;
	return entry.source === "default" ? [] : [entry.source];
}
