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
}: {
	entry: HistoricalSession;
	localNode: string | undefined;
}) {
	const navigate = useNavigate();
	return (
		<ButtonBase
			sx={phoneRowSx("done")}
			onClick={() => navigate(`/history/${entry.sessionId}`)}
		>
			<Box sx={phoneRowTitleSx}>{entry.title ?? entry.name}</Box>
			<ChevronRightIcon fontSize="small" sx={phoneRowChevronSx} />
			<Box sx={phoneRowMetaSx}>
				<span>{repoLabel(entry.cwd)}</span>
				<span>{formatRelativeTime(entry.timestamp)}</span>
				{entry.node && entry.node !== localNode && (
					<Box component="span" sx={tokenBadgeSx("neutral")}>
						{entry.node}
					</Box>
				)}
			</Box>
		</ButtonBase>
	);
}
