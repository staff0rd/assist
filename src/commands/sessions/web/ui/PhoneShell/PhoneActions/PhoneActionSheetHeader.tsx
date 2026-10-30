import Box from "@mui/material/Box";
import { repoLabel } from "../../App/repoLabel";
import { sessionTitle } from "../../App/sessionTitle";
import { displayStatus } from "../../displayStatus";
import type { SessionInfo } from "../../types";
import { PhoneSheetGrab } from "../PhoneSheetGrab";

const headerSx = { px: 2, pt: 0.75, pb: 1.25 } as const;

const subtitleSx = {
	fontSize: 13,
	color: "text.secondary",
	fontFamily: "fontFamilyMono",
} as const;

export function PhoneActionSheetHeader({
	session,
	localNode,
}: {
	session: SessionInfo;
	localNode: string | undefined;
}) {
	const subtitle = [
		repoLabel(session.cwd),
		session.node ?? localNode,
		displayStatus(session),
	]
		.filter(Boolean)
		.join(" · ");
	return (
		<>
			<PhoneSheetGrab />
			<Box sx={headerSx}>
				<Box sx={{ fontSize: 17, fontWeight: 600 }}>
					{sessionTitle(session)}
				</Box>
				<Box sx={subtitleSx}>{subtitle}</Box>
			</Box>
		</>
	);
}
