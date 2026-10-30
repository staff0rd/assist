import Box from "@mui/material/Box";
import { formatItemId } from "../../../../backlog/formatItemId";
import { tokenBadgeSx } from "../designSystem/tokenBadgeSx";
import type { SessionInfo } from "../types";

export function PhoneBadges({
	session,
	localNode,
}: {
	session: SessionInfo;
	localNode: string | undefined;
}) {
	const itemId =
		session.activity?.kind === "backlog" ? session.activity.itemId : undefined;
	const linkedNode =
		session.node && session.node !== localNode ? session.node : undefined;
	return (
		<>
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
