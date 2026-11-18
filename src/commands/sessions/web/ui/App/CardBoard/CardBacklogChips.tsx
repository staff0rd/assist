import { activityItemIds } from "../../../../../../shared/activityItemIds";
import { BacklogItemChip } from "../BacklogItemChip";
import { repoGroupCwd } from "../../repoGroupKey";
import type { SessionInfo } from "../../types";

export function CardBacklogChips({ session }: { session: SessionInfo }) {
	const cwd = repoGroupCwd(session);
	return activityItemIds(session.activity).map((itemId) => (
		<BacklogItemChip key={itemId} itemId={itemId} cwd={cwd} />
	));
}
