import type { ItemStatusCounts } from "../../../gitStatus";
import { usePolledGitStatus } from "../usePolledGitStatus";

export function useGitStatusCounts(
	cwd: string,
	sessionId?: string,
): ItemStatusCounts | null {
	return usePolledGitStatus(cwd, sessionId).counts;
}
