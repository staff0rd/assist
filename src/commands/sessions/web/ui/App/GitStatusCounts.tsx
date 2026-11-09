import type { ConversationTarget } from "../../../shared/sessionConversationTarget";
import { BranchDiffLink } from "./GitStatusCounts/BranchDiffLink";
import { GitStatusLink } from "./GitStatusCounts/GitStatusLink";
import { sessionDiffAffordance } from "./GitStatusCounts/sessionDiffAffordance";
import { useGitStatusCounts } from "./GitStatusCounts/useGitStatusCounts";

export function GitStatusCounts({
	panelSessionId,
	cwd,
	conversation,
	offerBranchDiff = false,
	toggleChordHint = false,
	countButton = false,
}: {
	panelSessionId: string;
	cwd: string;
	conversation?: ConversationTarget;
	offerBranchDiff?: boolean;
	toggleChordHint?: boolean;
	countButton?: boolean;
}) {
	const affordance = sessionDiffAffordance(
		useGitStatusCounts(cwd, conversation),
	);
	if (!affordance) return null;

	if (affordance.kind === "branch")
		return offerBranchDiff ? (
			<BranchDiffLink
				panelSessionId={panelSessionId}
				cwd={cwd}
				conversation={conversation}
				defaultBranch={affordance.defaultBranch}
			/>
		) : null;

	return (
		<GitStatusLink
			panelSessionId={panelSessionId}
			cwd={cwd}
			conversation={conversation}
			groups={affordance.groups}
			uncommitted={affordance.uncommitted}
			toggleChordHint={toggleChordHint}
			countButton={countButton}
		/>
	);
}
