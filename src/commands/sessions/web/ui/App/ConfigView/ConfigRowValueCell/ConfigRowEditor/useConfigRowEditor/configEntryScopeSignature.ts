import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import { configScopesWithValue } from "../../configScopesWithValue";

export function configEntryScopeSignature(entry: ConfigEntry): string {
	return [
		entry.key,
		entry.repoKey ?? "",
		entry.writableScopes?.join(",") ?? "",
		configScopesWithValue(entry).join(","),
	].join("|");
}
