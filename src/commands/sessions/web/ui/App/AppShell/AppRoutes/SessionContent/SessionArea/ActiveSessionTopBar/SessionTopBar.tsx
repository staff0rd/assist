import Box from "@mui/material/Box";
import { useRef, useState } from "react";
import { SessionTopBarCaptions } from "./SessionTopBar/SessionTopBarCaptions";
import { SessionTopBarControls } from "./SessionTopBar/SessionTopBarControls";
import type {
	SessionControlHandlers,
	SessionInfo,
} from "../../../../../../types";
import { useElementWidth } from "../../../useElementWidth";

const barSx = {
	position: "sticky",
	top: 0,
	zIndex: 1,
	display: "flex",
	alignItems: "center",
	gap: 1,
	px: 1.5,
	py: 0.75,
	borderBottom: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	overflow: "hidden",
} as const;

const labelledMinRemaining = 560;
const controlsReserve = 48;
const identityShare = 0.5;

export function SessionTopBar({
	session,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: { session: SessionInfo } & SessionControlHandlers) {
	const barRef = useRef<HTMLDivElement>(null);
	const width = useElementWidth(barRef);
	const [identityWidth, setIdentityWidth] = useState(0);
	const floor =
		width === null
			? identityWidth
			: Math.min(identityWidth, Math.max(width - controlsReserve, 0));
	const labelled = width === null || width - floor >= labelledMinRemaining;

	return (
		<Box ref={barRef} sx={barSx}>
			<SessionTopBarCaptions
				session={session}
				minWidth={floor}
				budget={width === null ? null : width * identityShare}
				onIdentityWidth={setIdentityWidth}
			/>
			<SessionTopBarControls
				session={session}
				labelled={labelled}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
		</Box>
	);
}
