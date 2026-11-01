import { gitMarkerPath } from "./gitMarkerPath";

export function syncPendingPath(cwd?: string): string {
	return gitMarkerPath("assist-watch-sync-pending", cwd);
}
