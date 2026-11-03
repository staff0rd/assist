import { gitMarkerPath } from "./gitMarkerPath";

export function buildPendingPath(cwd?: string): string {
	return gitMarkerPath("assist-watch-build-pending", cwd);
}
