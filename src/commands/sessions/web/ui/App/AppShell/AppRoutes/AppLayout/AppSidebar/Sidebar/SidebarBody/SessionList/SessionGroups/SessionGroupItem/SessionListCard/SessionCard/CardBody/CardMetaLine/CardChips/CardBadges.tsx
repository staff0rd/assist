import Chip from "@mui/material/Chip";
import { CloneBadge } from "./CardBadges/CloneBadge";
import { HarnessBadge } from "../../../../../../../../HarnessBadge";
import { isWindowsCwd } from "../../../../../../../../../../../../../../../isWindowsCwd";
import { ServingChip } from "./CardBadges/ServingChip";
import type { SessionInfo } from "../../../../../../../../../../../../../../../types";
import { useCloneBadgeContext } from "../../../../../../useCloneBadgeContext";
import { WindowsBadge } from "../../../../../../../../../../../../../WindowsBadge";

const chipSx = { height: 16, fontSize: "0.65rem" };

export function CardBadges({ session }: { session: SessionInfo }) {
	const badgeClone = useCloneBadgeContext().has(session.id);
	const clone = session.repoGroup?.clone;
	const { activity } = session;
	const inReview =
		activity?.kind === "backlog" && activity.phase === activity.totalPhases;

	return (
		<>
			<ServingChip session={session} />
			<HarnessBadge harness={session.harness} />
			{badgeClone && clone && <CloneBadge clone={clone} />}
			{isWindowsCwd(session.cwd) && <WindowsBadge />}
			{inReview && (
				<Chip
					label={`${activity.phase}/${activity.totalPhases}`}
					size="small"
					color="primary"
					sx={chipSx}
				/>
			)}
		</>
	);
}
