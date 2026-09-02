import { repoGroupCwd } from "./repoGroupKey";
import type { SessionInfo } from "./types";

export function cardForRepo(
	activeByRepo: Record<string, string>,
	selectedCwd: string,
	sessions: SessionInfo[],
): string | null {
	if (!selectedCwd) return null;
	const id = activeByRepo[selectedCwd];
	if (!id) return null;
	const session = sessions.find((s) => s.id === id);
	if (!session || repoGroupCwd(session) !== selectedCwd) return null;
	return id;
}
