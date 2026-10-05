import { gitMarkerPath } from "./gitMarkerPath";

export type WatchControlPaths = { check: string; stop: string };

export function watchControlPaths(cwd?: string): WatchControlPaths | undefined {
	try {
		return {
			check: gitMarkerPath("assist-watch-check", cwd),
			stop: gitMarkerPath("assist-watch-stop", cwd),
		};
	} catch {
		return undefined;
	}
}
