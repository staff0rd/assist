import { changedPaths } from "../../../watch/changedPaths";

export function changedSince(installDir: string) {
	return (commit: string): string[] => {
		try {
			return changedPaths(commit, installDir);
		} catch {
			return [];
		}
	};
}
