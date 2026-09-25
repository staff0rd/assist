import type { ConfigEntry } from "../../../../../../../config/readConfigEntries";
import { configScopeFiles } from "../configScopeFiles";
import { configScopeLabels } from "../configScopeLabels";
import { configScopesWithValue } from "../configScopesWithValue";
import type { ConfigScope } from "../saveConfigValue";

export function configClearTitle(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	const where = configScopeFiles(entry.repoKey, entry.globalConfigFile)[scope];
	const fallback = configScopesWithValue(entry).find(
		(source) => source !== scope,
	);
	return fallback
		? `Remove ${entry.key} from ${where} — falls back to ${configScopeLabels[fallback]}`
		: `Remove ${entry.key} from ${where} — reverts to the schema default`;
}
