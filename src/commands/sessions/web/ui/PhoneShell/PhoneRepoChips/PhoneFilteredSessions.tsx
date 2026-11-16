import { repoLabel } from "../../App/repoLabel";
import type { SessionInfo } from "../../types";
import { PhoneSessionGroups } from "../PhoneSessionGroups";
import { PhoneRepoEmpty } from "./PhoneRepoEmpty";

export function PhoneFilteredSessions({
	sessions,
	repo,
	localNode,
	onShowAll,
}: {
	sessions: SessionInfo[];
	repo: string | null;
	localNode: string | undefined;
	onShowAll: () => void;
}) {
	if (repo !== null && sessions.length === 0)
		return (
			<PhoneRepoEmpty
				message={`No sessions in ${repoLabel(repo)}`}
				onShowAll={onShowAll}
			/>
		);
	return (
		<PhoneSessionGroups
			sessions={sessions}
			localNode={localNode}
			hideRepo={repo !== null}
		/>
	);
}
