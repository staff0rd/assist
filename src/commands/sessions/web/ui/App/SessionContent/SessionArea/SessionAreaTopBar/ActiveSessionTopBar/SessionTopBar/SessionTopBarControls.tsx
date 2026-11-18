import Box from "@mui/material/Box";
import { useRef } from "react";
import { SessionActionButtons } from "../../../../SessionActionButtons";
import { SessionTopBarDiff } from "./SessionTopBarControls/SessionTopBarDiff";
import { SessionTopBarDismiss } from "./SessionTopBarControls/SessionTopBarDismiss";
import { SessionTopBarElapsed } from "./SessionTopBarControls/SessionTopBarElapsed";
import { SessionTopBarToggles } from "./SessionTopBarControls/SessionTopBarToggles";
import type {
	SessionControlHandlers,
	SessionInfo,
} from "../../../../../../types";
import { LabelledActionsContext } from "../../../../../useLabelledActionsContext";
import { controlsBoxSx } from "./SessionTopBarControls/controlsBoxSx";
import { useBalancedWrapWidth } from "./SessionTopBarControls/useBalancedWrapWidth";

export function SessionTopBarControls({
	session,
	labelled,
	available,
	leading = false,
	onRetry,
	onRestart,
	onStartOver,
	onDismiss,
	childDismiss,
	onSetAutoApprove,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	labelled: boolean;
	available: number | null;
	leading?: boolean;
} & SessionControlHandlers) {
	const boxRef = useRef<HTMLDivElement>(null);
	const width = useBalancedWrapWidth(boxRef, available);

	return (
		<Box ref={boxRef} sx={controlsBoxSx(leading, width)}>
			<SessionTopBarDiff session={session} />
			<SessionTopBarElapsed session={session} />
			<SessionTopBarToggles
				session={session}
				onSetAutoApprove={onSetAutoApprove}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
			<LabelledActionsContext.Provider value={labelled}>
				<SessionActionButtons
					session={session}
					onRetry={onRetry}
					onRestart={onRestart}
					onStartOver={onStartOver}
					onDismiss={onDismiss}
					childDismiss={childDismiss}
				/>
			</LabelledActionsContext.Provider>
			<SessionTopBarDismiss
				session={session}
				onDismiss={onDismiss}
				childDismiss={childDismiss}
			/>
		</Box>
	);
}
