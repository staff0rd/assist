import type { ConfigEntry } from "../../../../../../config/readConfigEntries";

export function effectiveConfigValue(entry: ConfigEntry): unknown {
	return entry.value === undefined ? entry.defaultValue : entry.value;
}
