import { loadConfig } from "../../../../shared/loadConfig";

type LinkVersionCheck = "block" | "warn" | "off";

export function linkVersionCheck(): LinkVersionCheck {
	return loadConfig().sessions?.linkVersionCheck ?? "block";
}
