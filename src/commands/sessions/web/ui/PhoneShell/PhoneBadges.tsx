import Box from "@mui/material/Box";
import { formatItemId } from "../../../../backlog/formatItemId";
import { reviewPhaseBadgeSx } from "../designSystem/reviewPhaseBadgeSx";
import { tokenBadgeSx } from "../designSystem/tokenBadgeSx";
import type { SessionInfo } from "../types";
import { reviewPhaseLabel } from "./reviewPhaseLabel";

export function PhoneBadges({
	session,
	localNode,
	hideNode,
}: {
	session: SessionInfo;
	localNode: string | undefined;
	hideNode?: boolean;
}) {
	const itemId =
		session.activity?.kind === "backlog" ? session.activity.itemId : undefined;
	const linkedNode =
		!hideNode && session.node && session.node !== localNode
			? session.node
			: undefined;
	const reviewPhase = reviewPhaseLabel(session);
	return (
		<>
			{reviewPhase && (
				<Box
					component="span"
					sx={reviewPhaseBadgeSx}
					data-testid="review-phase-badge"
				>
					{reviewPhase}
				</Box>
			)}
			{itemId !== undefined && (
				<Box component="span" sx={tokenBadgeSx("primary")}>
					{formatItemId(itemId)}
				</Box>
			)}
			{linkedNode && (
				<Box
					component="span"
					sx={tokenBadgeSx("neutral")}
					data-testid="node-badge"
				>
					{linkedNode}
				</Box>
			)}
		</>
	);
}
