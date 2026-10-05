import { gitMarkerPath } from "./gitMarkerPath";

export function simulatedDivergencePath(cwd?: string): string {
	return gitMarkerPath("assist-simulate-divergence", cwd);
}
