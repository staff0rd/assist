import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { statusPillSx } from "../../../../../../../designSystem/statusPillSx";
import { displayStatus } from "../../../../../../../displayStatus";
import { statusGlyph } from "../../../../../../../statusGlyph";
import { isVerifying } from "../../../../../../isVerifying";
import { SdkBadge } from "../../../../../../../SdkBadge";
import { SessionStatusDot } from "./SessionTopBarStatus/SessionStatusDot";
import { statusColors } from "../../../../../../statusColors";
import type { SessionInfo } from "../../../../../../../types";

const asideSx = { flexShrink: 0, whiteSpace: "nowrap" } as const;

function StatusLabel({ session }: { session: SessionInfo }) {
	if (!isVerifying(session))
		return <SessionStatusDot status={displayStatus(session)} label />;

	return (
		<Box component="span" sx={statusPillSx(statusColors.running)}>
			{statusGlyph.running} verifying
		</Box>
	);
}

export function SessionTopBarStatus({ session }: { session: SessionInfo }) {
	const { restored } = session;

	return (
		<>
			<StatusLabel session={session} />
			{session.sdk && <SdkBadge label="Claude · SDK" />}
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{ ...asideSx, color: restored ? "success.main" : "warning.main" }}
				>
					{restored ? "restored" : "not restored"}
				</Typography>
			)}
		</>
	);
}
