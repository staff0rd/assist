import { loadConfig } from "../../../shared/loadConfig";

export type WindowsVersionCheck = "block" | "warn" | "off";

export function windowsVersionCheck(): WindowsVersionCheck {
	return loadConfig().sessions?.windowsVersionCheck ?? "block";
}
