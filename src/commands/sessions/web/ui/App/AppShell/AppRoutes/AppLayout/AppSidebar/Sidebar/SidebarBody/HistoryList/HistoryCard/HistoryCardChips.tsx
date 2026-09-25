import Chip from "@mui/material/Chip";
import { ItemTrackerLink } from "../../../../../../../../../../../../backlog/web/ui/components/ItemTrackerLink";
import { BacklogItemChip } from "../../../../../../BacklogItemChip";
import { HarnessBadge } from "../../HarnessBadge";
import { isRepoScoped } from "../../../../../../isRepoScoped";
import { repoLabel } from "../../../../../../../repoLabel";
import type { HistoricalSession } from "../../../../../../../../../types";
import { useItemTrackers } from "../../useItemTrackers";
import { WindowsBadge } from "../../../../../../../WindowsBadge";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function HistoryCardChips({ session }: { session: HistoricalSession }) {
	const repo = isRepoScoped(session.sessionType) ? repoLabel(session.cwd) : "";
	const trackerFor = useItemTrackers(session.cwd);
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			<HarnessBadge harness={session.harness} />
			{session.origin === "windows" && <WindowsBadge />}
			{session.sessionType && session.sessionType !== "next" && (
				<Chip
					label={session.sessionType}
					size="small"
					color="primary"
					variant="outlined"
					sx={chipSx}
				/>
			)}
			{session.itemId != null && (
				<BacklogItemChip itemId={session.itemId} cwd={session.cwd} />
			)}
			<ItemTrackerLink variant="chip" tracker={trackerFor(session.itemId)} />
		</>
	);
}
