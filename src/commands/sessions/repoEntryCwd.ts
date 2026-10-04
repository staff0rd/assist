import { repoGroupForCwd } from "./daemon/repoGroupForCwd";

export function repoEntryCwd(serverCwd: string): string {
	return repoGroupForCwd(serverCwd)?.clone ?? serverCwd;
}
