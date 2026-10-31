import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useNavigate } from "react-router";
import { formatItemId } from "../../../../../backlog/formatItemId";
import type { BacklogItemSummary } from "../../../../../backlog/web/ui/types";
import { SessionStatusGlyph } from "../../App/AppSidebar/SessionCard/CardHeader/SessionStatusGlyph";
import {
	phoneRowChevronSx,
	phoneRowMetaSx,
	phoneRowSx,
	phoneRowTitleSx,
} from "../phoneRowSx";
import { backlogItemPath } from "./backlogItemPath";

const idSx = { fontFamily: "fontFamilyMono", fontSize: 12 } as const;

function planLabel({ currentPhase, totalPhases }: BacklogItemSummary): string {
	if (!totalPhases) return "no plan";
	if (currentPhase) return `${currentPhase}/${totalPhases}`;
	return totalPhases === 1 ? "1 phase" : `${totalPhases} phases`;
}

export function PhoneBacklogRow({
	item,
	cwd,
	running,
}: {
	item: BacklogItemSummary;
	cwd: string;
	running: boolean;
}) {
	const navigate = useNavigate();
	return (
		<ButtonBase
			sx={phoneRowSx(running ? "running" : "idle")}
			onClick={() => navigate(backlogItemPath(item.id, { cwd }))}
			data-testid="phone-backlog-row"
		>
			<SessionStatusGlyph status={running ? "running" : "idle"} />
			<Box sx={phoneRowTitleSx}>{item.name}</Box>
			<ChevronRightIcon fontSize="small" sx={phoneRowChevronSx} />
			<Box sx={phoneRowMetaSx}>
				<Box component="span" sx={idSx}>
					{formatItemId(item.id)}
				</Box>
				<Box
					component="span"
					sx={{ color: item.type === "bug" ? "error.main" : undefined }}
				>
					{item.type}
				</Box>
				<span>{planLabel(item)}</span>
				{running && (
					<Box component="span" sx={{ color: "success.main" }}>
						running
					</Box>
				)}
			</Box>
		</ButtonBase>
	);
}
