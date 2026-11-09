import { loadConfigFrom } from "../../../../../shared/loadConfigFrom";
import { DEFAULT_IDLE_MINUTES } from "./autoRestartBlocker";

export function autoRestartIdleMinutes(installDir: string): number {
	try {
		return (
			loadConfigFrom(installDir).autoUpdate?.idleMinutes ?? DEFAULT_IDLE_MINUTES
		);
	} catch {
		return DEFAULT_IDLE_MINUTES;
	}
}
