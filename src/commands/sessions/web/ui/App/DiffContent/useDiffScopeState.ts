import type { CommitRef } from "../../../../../../shared/db/listCommitRefs";
import type { ConversationTarget } from "../../../../shared/sessionConversationTarget";
import { BRANCH_DIFF_SCOPE, DEFAULT_DIFF_SCOPE } from "../diffScopeOptions";
import { useDiffScopes } from "./useDiffScopeState/useDiffScopes";

export type DiffScopeState = {
	scope: string;
	commits: CommitRef[];
	branchBase: string | null;
};

export function useDiffScopeState(
	cwd: string,
	conversation: ConversationTarget | undefined,
	requested: string,
): DiffScopeState {
	const { commits, branchBase, loaded } = useDiffScopes(cwd, conversation);
	const unavailableBranch =
		requested === BRANCH_DIFF_SCOPE && loaded && !branchBase;
	return {
		scope: unavailableBranch ? DEFAULT_DIFF_SCOPE : requested,
		commits,
		branchBase,
	};
}
