import { sessionConversationTarget } from "../../../../../../../../../shared/sessionConversationTarget";
import { GitStatusCounts } from "../../../../../../GitStatusCounts";
import type { SessionInfo } from "../../../../../../../types";

export function SessionTopBarDiff({ session }: { session: SessionInfo }) {
	if (!session.cwd) return null;

	return (
		<GitStatusCounts
			panelSessionId={session.id}
			cwd={session.cwd}
			conversation={sessionConversationTarget(session)}
			offerBranchDiff
			toggleChordHint
			countButton
		/>
	);
}
