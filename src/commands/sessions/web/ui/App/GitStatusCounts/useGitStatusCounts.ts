import type { ItemStatusCounts } from "../../../gitStatus";
import type { ConversationTarget } from "../../../../shared/sessionConversationTarget";
import { usePolledGitStatus } from "../usePolledGitStatus";

export function useGitStatusCounts(
	cwd: string,
	conversation?: ConversationTarget,
): ItemStatusCounts | null {
	return usePolledGitStatus(cwd, conversation).counts;
}
