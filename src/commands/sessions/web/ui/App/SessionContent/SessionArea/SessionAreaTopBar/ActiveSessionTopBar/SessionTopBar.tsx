import Box from "@mui/material/Box";
import { useRef } from "react";
import { SessionTopBarCaptions } from "./SessionTopBar/SessionTopBarCaptions";
import { SessionTopBarControls } from "./SessionTopBar/SessionTopBarControls";
import { barGap, useTopBarLayout } from "./SessionTopBar/useTopBarLayout";
import type { SessionControlHandlers, SessionInfo } from "../../../../../types";

const barSx = {
	position: "sticky",
	top: 0,
	zIndex: 1,
	display: "flex",
	alignItems: "center",
	gap: `${barGap}px`,
	px: 1.5,
	py: 0.75,
	borderBottom: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	overflow: "hidden",
} as const;

export function SessionTopBar({
	session,
	...handlers
}: { session: SessionInfo } & SessionControlHandlers) {
	const barRef = useRef<HTMLDivElement>(null);
	const layout = useTopBarLayout(barRef);

	return (
		<Box ref={barRef} sx={barSx}>
			<SessionTopBarCaptions
				session={session}
				minWidth={layout.floor}
				budget={layout.budget}
				onIdentityWidth={layout.setIdentityWidth}
			/>
			<SessionTopBarControls
				session={session}
				labelled={layout.labelled}
				available={layout.available}
				{...handlers}
			/>
		</Box>
	);
}
