import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useNavigate } from "react-router";
import { repoLabel } from "../App/repoLabel";
import { tokenBadgeSx } from "../designSystem/tokenBadgeSx";
import { formatRelativeTime } from "../formatRelativeTime";
import type { HistoricalSession } from "../types";
import {
	phoneRowChevronSx,
	phoneRowMetaSx,
	phoneRowSx,
	phoneRowTitleSx,
} from "./phoneRowSx";

export function PhoneHistoryRow({
	entry,
	localNode,
	hideRepo,
}: {
	entry: HistoricalSession;
	localNode: string | undefined;
	hideRepo?: boolean;
}) {
	const navigate = useNavigate();
	return (
		<ButtonBase
			sx={phoneRowSx("done")}
			onClick={() =>
				navigate(
					entry.node
						? `/history/${entry.sessionId}?node=${encodeURIComponent(entry.node)}`
						: `/history/${entry.sessionId}`,
				)
			}
		>
			<Box sx={phoneRowTitleSx}>{entry.title ?? entry.name}</Box>
			<ChevronRightIcon fontSize="small" sx={phoneRowChevronSx} />
			<Box sx={phoneRowMetaSx}>
				{!hideRepo && <span>{repoLabel(entry.cwd)}</span>}
				<span>{formatRelativeTime(entry.lastActivity ?? entry.timestamp)}</span>
				{entry.node && entry.node !== localNode && (
					<Box component="span" sx={tokenBadgeSx("neutral")}>
						{entry.node}
					</Box>
				)}
			</Box>
		</ButtonBase>
	);
}
