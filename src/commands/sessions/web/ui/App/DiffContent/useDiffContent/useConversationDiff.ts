import type { ConversationTarget } from "../../../../../shared/sessionConversationTarget";
import { useDiffScopeState } from "../useDiffScopeState";
import { useDiff } from "./useDiff";
import { useScopedDiffRevert } from "./useScopedDiffRevert";

export function useConversationDiff(
	cwd: string,
	conversation: ConversationTarget | undefined,
	scope: string,
) {
	const scopeState = useDiffScopeState(cwd, conversation, scope);
	const { diff, loading, error, refresh } = useDiff(
		cwd,
		conversation,
		scopeState.scope,
	);
	const { revert, uncommittedFiles } = useScopedDiffRevert(
		cwd,
		conversation,
		scopeState.scope,
		refresh,
	);
	return { scopeState, diff, loading, error, revert, uncommittedFiles };
}
