import Box from "@mui/material/Box";
import { useRef } from "react";
import { SessionActionButtons } from "../../../../../SessionActionButtons";
import { SessionTopBarDiff } from "./SessionTopBarControls/SessionTopBarDiff";
import { SessionTopBarDismiss } from "./SessionTopBarControls/SessionTopBarDismiss";
import { SessionTopBarElapsed } from "./SessionTopBarControls/SessionTopBarElapsed";
import { SessionTopBarToggles } from "./SessionTopBarControls/SessionTopBarToggles";
import type {
	SessionControlHandlers,
	SessionInfo,
} from "../../../../../../types";
import { LabelledActionsContext } from "../../../../../useLabelledActionsContext";
import { useBalancedWrapWidth } from "./SessionTopBarControls/useBalancedWrapWidth";

const controlsSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 1,
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: "auto",
	minWidth: 0,
} as const;

export function SessionTopBarControls({
	session,
	labelled,
	available,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	labelled: boolean;
	available: number | null;
} & SessionControlHandlers) {
	const boxRef = useRef<HTMLDivElement>(null);
	const width = useBalancedWrapWidth(boxRef, available);

	return (
		<Box ref={boxRef} sx={{ ...controlsSx, width }}>
			<SessionTopBarDiff session={session} />
			<SessionTopBarElapsed session={session} />
			<SessionTopBarToggles
				session={session}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
			<LabelledActionsContext.Provider value={labelled}>
				<SessionActionButtons
					session={session}
					onRetry={onRetry}
					onRestart={onRestart}
					onDismiss={onDismiss}
				/>
			</LabelledActionsContext.Provider>
			<SessionTopBarDismiss session={session} onDismiss={onDismiss} />
		</Box>
	);
}
