import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import { assistConfigSchema } from "../../shared/types";

export function readInboxIntervalMinutes(
	globalConfigPath?: string,
): number | undefined {
	const raw = loadGlobalConfigRaw(globalConfigPath);
	return assistConfigSchema.shape.inbox.parse(raw.inbox)?.intervalMinutes;
}
