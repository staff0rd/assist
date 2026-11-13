import { loadConfig } from "../../../../shared/loadConfig";

export function cleanLeftoversEnabled(): boolean {
	return loadConfig().sessions?.cleanLeftovers ?? true;
}
