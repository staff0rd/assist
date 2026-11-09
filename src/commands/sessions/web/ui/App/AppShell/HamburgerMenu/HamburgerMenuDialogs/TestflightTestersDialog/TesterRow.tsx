import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { statusPillSx } from "../../../../../designSystem/statusPillSx";
import type {
	TeamStatus,
	TesterState,
} from "../../../../../../../../testflight/TestflightTesters";
import { testerPills } from "./testerPills";
import { testerEmailSx as emailSx, testerRowSx as rowSx } from "./testerRowSx";

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
	addToGroup,
}: {
	email: string;
	team?: TeamStatus;
	testflight: TesterState;
	addToGroup?: { pending: boolean; disabled: boolean; onClick: () => void };
}) {
	return (
		<Box sx={rowSx} data-testid="tester-row">
			<Box component="span" sx={emailSx} title={email}>
				{email}
			</Box>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{team && <StatusPill {...testerPills.team[team]} />}
				<StatusPill {...testerPills.testflight[testflight]} />
				{addToGroup && (
					<Button
						variant="outlined"
						size="small"
						onClick={addToGroup.onClick}
						disabled={addToGroup.disabled}
						loading={addToGroup.pending}
					>
						Add to group
					</Button>
				)}
			</Box>
		</Box>
	);
}
