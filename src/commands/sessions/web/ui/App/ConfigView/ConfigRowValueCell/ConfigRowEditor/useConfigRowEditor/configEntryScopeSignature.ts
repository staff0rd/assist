import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import { configScopesWithValue } from "../../configScopesWithValue";

export function configEntryScopeSignature(entry: ConfigEntry): string {
	return [
		entry.key,
		entry.repoKey ?? "",
		entry.globalOnly === true ? "global-only" : "",
		configScopesWithValue(entry).join(","),
	].join("|");
}
