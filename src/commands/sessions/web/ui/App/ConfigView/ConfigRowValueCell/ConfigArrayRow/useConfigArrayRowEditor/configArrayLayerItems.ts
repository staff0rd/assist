import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import type { ConfigScope } from "../../saveConfigValue";

export function configArrayLayerItems(
	entry: ConfigEntry,
	scope: ConfigScope,
): unknown[] {
	const layer = entry.layers?.[scope];
	return Array.isArray(layer) ? layer : [];
}
