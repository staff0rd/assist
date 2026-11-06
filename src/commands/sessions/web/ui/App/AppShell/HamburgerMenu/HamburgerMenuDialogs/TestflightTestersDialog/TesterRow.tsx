import Box from "@mui/material/Box";
import { listRowHeight } from "../../../../../designSystem/listRowHeight";
import { statusPillSx } from "../../../../../designSystem/statusPillSx";
import type {
	TeamStatus,
	TesterState,
} from "../../../../../../../../testflight/TestflightTesters";
import { testerPills } from "./testerPills";

const rowSx = {
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	columnGap: 1.5,
	rowGap: 0.75,
	px: 3,
	py: 1,
	minHeight: listRowHeight,
	"&:hover": { bgcolor: "action.hover" },
} as const;

const emailSx = {
	flex: "1 1 160px",
	minWidth: 0,
	fontSize: 14,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

function StatusPill({ label, color }: { label: string; color: string }) {
	return (
		<Box component="span" sx={statusPillSx(color)}>
			{label}
		</Box>
	);
}

export function TesterRow({
	email,
	team,
	testflight,
}: {
	email: string;
	team?: TeamStatus;
	testflight: TesterState;
}) {
	return (
		<Box sx={rowSx} data-testid="tester-row">
			<Box component="span" sx={emailSx} title={email}>
				{email}
			</Box>
			<Box sx={{ display: "flex", gap: 1 }}>
				{team && <StatusPill {...testerPills.team[team]} />}
				<StatusPill {...testerPills.testflight[testflight]} />
			</Box>
		</Box>
	);
}
