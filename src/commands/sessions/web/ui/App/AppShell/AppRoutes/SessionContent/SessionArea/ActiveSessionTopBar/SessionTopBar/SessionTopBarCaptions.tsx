import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "react";
import { sessionPhaseCaption } from "../../../../sessionPhaseCaption";
import { SessionTopBarIds } from "./SessionTopBarCaptions/SessionTopBarIds";
import { SessionTopBarStatus } from "./SessionTopBarCaptions/SessionTopBarStatus";
import { SessionTopBarTitle } from "./SessionTopBarCaptions/SessionTopBarTitle";
import type { SessionInfo } from "../../../../../../../types";
import { useIdentityLayout } from "./SessionTopBarCaptions/useIdentityLayout";

const columnSx = {
	display: "flex",
	flexDirection: "column",
	flexGrow: 1,
	flexShrink: 1,
	flexBasis: 0,
	overflow: "hidden",
} as const;

const rowSx = {
	display: "flex",
	alignItems: "center",
	alignSelf: "flex-start",
	gap: 1,
} as const;

const phaseSx = {
	color: "text.secondary",
	fontSize: "0.875rem",
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function SessionTopBarCaptions({
	session,
	minWidth,
	budget,
	onIdentityWidth,
}: {
	session: SessionInfo;
	minWidth: number;
	budget: number | null;
	onIdentityWidth: (width: number) => void;
}) {
	const rowRef = useRef<HTMLDivElement>(null);
	const { width, collapsed } = useIdentityLayout(rowRef, budget);
	const caption = sessionPhaseCaption(session);

	useEffect(() => onIdentityWidth(width), [width, onIdentityWidth]);

	return (
		<Box sx={{ ...columnSx, minWidth: `${minWidth}px` }}>
			<Box ref={rowRef} sx={rowSx}>
				<SessionTopBarIds session={session} collapsed={collapsed} />
				<SessionTopBarStatus session={session} />
			</Box>
			<SessionTopBarTitle session={session} />
			{caption && <Typography sx={phaseSx}>{caption}</Typography>}
		</Box>
	);
}
