import { loadConfig } from "../../../../shared/loadConfig";

export function reportLeftoversEnabled(): boolean {
	return loadConfig().sessions?.reportLeftovers ?? true;
}
